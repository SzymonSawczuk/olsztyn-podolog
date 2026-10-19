"""Generuje podstrony usług z plików w _build/uslugi/.

Nagłówek, stopka, baner cookies i ceny są kopiowane z index.html, więc zmiany
wprowadza się tylko tam. Skrypt aktualizuje też dane FAQ strony głównej
(JSON-LD) i sitemap.xml.

Uruchomienie (z katalogu projektu):  python3 _build/build_pages.py
"""
import datetime
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_build" / "uslugi"
SITE = "https://olsztyn-podolog.pl"
BUSINESS_ID = f"{SITE}/#gabinet"

IMAGE_SIZES = {
    "Agnieszka.jpeg": (457, 640), "Gabinet.jpeg": (640, 427), "Gabinet_2.jpeg": (640, 454),
    "Korytarz.jpeg": (640, 417), "Kwiat.jpeg": (640, 427), "Motto.jpeg": (640, 457),
    "Narzędzia.jpeg": (640, 427), "Recepcja.jpeg": (640, 427), "Stolik.jpeg": (450, 640),
    "Wizytówki.jpeg": (640, 446), "Zespół.jpeg": (457, 640),
}


def between(text, start, end):
    i = text.index(start)
    j = text.index(end, i)
    return text[i:j]


def strip_comments(text):
    return re.sub(r"\s*<!--.*?-->", "", text, flags=re.S)


def plain(fragment):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", fragment))).strip()


def faq_items(fragment):
    return [(plain(q), plain(a)) for q, a in re.findall(
        r"<details>\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>\s*</details>", fragment, re.S)]


def faq_ld(items):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items],
    }


def ld_script(data):
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return '    <script type="application/ld+json">\n' + \
        "\n".join("    " + line for line in body.splitlines()) + "\n    </script>"


def price_offer(name, price):
    nums = [int(n) for n in re.findall(r"\d+", price)]
    offer = {"@type": "Offer", "name": name, "priceCurrency": "PLN"}
    if len(nums) == 1:
        offer["price"] = nums[0]
    else:
        offer["priceSpecification"] = {"@type": "PriceSpecification", "minPrice": nums[0],
                                       "maxPrice": nums[1], "priceCurrency": "PLN"}
    return offer


def parse_source(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    meta = {}
    for line in m.group(1).strip().splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    meta["slug"] = path.stem
    meta["body"] = strip_comments(text[m.end():]).strip()
    return meta


def main():
    index_path = ROOT / "index.html"
    index = index_path.read_text(encoding="utf-8")

    header = between(index, '      <div id="app_header"', "      <main>").rstrip()
    footer = between(index, '      <div id="app_footer"', "\n    </div>\n\n    <div id=\"cookie-banner\"").rstrip()
    # przycisk "Umów wizytę" z sekcji Lokalizacja, żeby wyglądał identycznie
    call_button = re.search(r'<a href="tel:\+48501768849"\s+class="inline-block mb-8[^"]*">.*?</a>', index, re.S).group(0)
    call_button = re.sub(r"\s*\n\s*", " ", call_button).replace('class="inline-block mb-8 ', 'class="cta-tel inline-block ')
    banner = between(index, '    <div id="cookie-banner"', '    <script src="script.js">').rstrip()

    prices = {}
    for name, desc, price in re.findall(
            r'<h4 class="text-xl font-semibold mb-2 text-black">([^<]+)</h4>\s*'
            r'<p class="text-gray-700 min-h-\[3rem\]">([^<]*)</p>.*?'
            r'<div class="text-pink-400 font-bold text-lg mt-auto">([^<]+)</div>', index, re.S):
        prices[name.strip()] = (desc.strip().replace("&nbsp;", ""), price.strip())

    pages = [parse_source(p) for p in sorted(SRC.glob("*.html"))]
    today = datetime.date.today().isoformat()

    for page in pages:
        url = f"{SITE}/{page['slug']}"
        services = [s.strip() for s in page["services"].split(";")]
        missing = [s for s in services if s not in prices]
        if missing:
            raise SystemExit(f"{page['slug']}: brak w cenniku index.html: {missing}")

        price_rows = "\n".join(
            f'            <li><span>{name}{f"<small>{prices[name][0]}</small>" if prices[name][0] else ""}</span>'
            f'<span class="price">{prices[name][1]}</span></li>' for name in services)

        img_file, _, img_alt = page["image"].partition("|")
        img_file, img_alt = img_file.strip(), img_alt.strip()
        w, h = IMAGE_SIZES[img_file]

        others = [f'<a href="/{p["slug"]}">{p["crumb"].lower() if p["crumb"] != "Manicure" else "manicure"}</a>'
                  for p in pages if p is not page]
        related = ", ".join(others[:-1]) + " oraz " + others[-1]

        ld = [
            {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": page["crumb"],
                "serviceType": page["crumb"],
                "description": page["description"],
                "url": url,
                "areaServed": {"@type": "City", "name": "Olsztyn"},
                "provider": {"@type": ["MedicalBusiness", "HealthAndBeautyBusiness"], "@id": BUSINESS_ID,
                             "name": "Gabinet Specjalistycznej Pielęgnacji Stóp i Dłoni Agnieszka Sawczuk",
                             "telephone": "+48501768849",
                             "address": {"@type": "PostalAddress", "streetAddress": "ul. Krzysztofa Mrongowiusza 6/4",
                                         "addressLocality": "Olsztyn", "postalCode": "11-041", "addressCountry": "PL"}},
                "offers": [price_offer(name, prices[name][1]) for name in services],
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Strona główna", "item": f"{SITE}/"},
                    {"@type": "ListItem", "position": 2, "name": page["crumb"], "item": url},
                ],
            },
        ]
        faqs = faq_items(page["body"])
        if faqs:
            ld.append(faq_ld(faqs))

        # pierwszy akapit .lead trafia do sekcji hero, reszta do karty z treścią
        lead_match = re.match(r'<p class="lead">.*?</p>\s*', page["body"], re.S)
        lead = lead_match.group(0).strip() if lead_match else ""
        rest = page["body"][lead_match.end():] if lead_match else page["body"]
        body = "\n".join("          " + line if line.strip() else "" for line in rest.splitlines())
        lead = "\n".join("            " + line for line in lead.splitlines())

        # czarna linia + różowy dopisek, jak w hero strony głównej
        h1_html = f'<span class="h1-main">{page["h1"]}</span>'
        if page.get("h1_accent"):
            h1_html += f' <span class="h1-accent">{page["h1_accent"]}</span>'

        title = html.escape(page["title"], quote=True)
        description = html.escape(page["description"], quote=True)

        out = f"""<!doctype html>
<!-- Plik generowany przez _build/build_pages.py z _build/uslugi/{page['slug']}.html. Nie edytuj ręcznie. -->
<html lang="pl">
  <head>
    <meta charset="utf-8">
    <title>{title}</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="description" content="{description}">
    <meta name="author" content="Gabinet Specjalistycznej Pielęgnacji Stóp i Dłoni Agnieszka Sawczuk">
    <link rel="canonical" href="{url}">

    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{SITE}/data/gallery/og/Gabinet.jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{url}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="pl_PL">
    <meta property="og:site_name" content="Podolog Olsztyn, Agnieszka Sawczuk">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="48x48" href="data/gallery/favicon.png">
    <link rel="apple-touch-icon" href="data/gallery/apple-touch-icon.png">

    <!--Tailwind-->
    <link href="assets/tailwind-style.css" rel="stylesheet">

    <link
      rel="stylesheet"
      href="assets/styles.css"
    />

{chr(10).join(ld_script(x) for x in ld)}

  </head>

  <body>
    <div class="w-screen">
{header}
      <div class="subpage-pattern" aria-hidden="true"></div>
      <div class="subpage-fade" aria-hidden="true"></div>
      <main class="subpage">
        <div class="subpage-hero">
          <div class="subpage-hero-text">
            <nav class="breadcrumb" aria-label="Okruszki">
              <a href="/">Strona główna</a> › <span>{page['crumb']}</span>
            </nav>
            <h1>{h1_html}</h1>
{lead}
            {call_button}
          </div>
        </div>

        <figure class="subpage-photo">
          <img src="data/gallery/min/{img_file}"
               srcset="data/gallery/min/{img_file} 640w, data/gallery/max/{img_file} 1920w"
               sizes="(min-width: 900px) 832px, 100vw"
               alt="{html.escape(img_alt, quote=True)}" width="{w}" height="{h}" fetchpriority="high">
        </figure>

        <article class="subpage-card">
{body}

          <h2>Cennik</h2>
          <ul class="price-list">
{price_rows}
          </ul>
          <p>Pełny cennik znajdziesz na <a href="/#uslugi">stronie głównej</a>.</p>

          <div class="cta-box">
            <p>Gabinet podologiczny w Olsztynie, ul. Krzysztofa Mrongowiusza 6/4<br>pon–pt 9:00–18:00</p>
            {call_button}
          </div>

          <h2>Inne usługi</h2>
          <p>Pozostałe zabiegi w naszym gabinecie: {related}.</p>
        </article>
      </main>
{footer}

    </div>

{banner}

    <script src="script.js"></script>

  </body>
</html>
"""
        (ROOT / f"{page['slug']}.html").write_text(out, encoding="utf-8")
        print("zapisano", page["slug"] + ".html")

    # FAQ strony głównej -> JSON-LD
    home_faq = faq_items(between(index, '<section id="faq"', "</section>"))
    new_ld = '<script type="application/ld+json" id="faq-ld">\n' + \
        "\n".join("    " + line for line in json.dumps(faq_ld(home_faq), ensure_ascii=False, indent=2).splitlines()) + \
        "\n    </script>"
    index = re.sub(r'<script type="application/ld\+json" id="faq-ld">.*?</script>', lambda _: new_ld, index, flags=re.S)
    index_path.write_text(index, encoding="utf-8")
    print("zaktualizowano FAQ w index.html:", len(home_faq), "pytań")

    # sitemap
    urls = [f"{SITE}/"] + [f"{SITE}/{p['slug']}" for p in pages] + [f"{SITE}/polityka-prywatnosci"]
    entries = "\n".join(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n' + entries + "\n</urlset>\n",
        encoding="utf-8")
    print("zaktualizowano sitemap.xml:", len(urls), "adresów")


if __name__ == "__main__":
    main()
