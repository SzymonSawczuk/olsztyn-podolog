async function loadPart(id, url) {
  const el = document.getElementById(id);
  if (el) {
    const res = await fetch(url);
    el.innerHTML = await res.text();
  }
}

Promise.all([
  loadPart('app_header', 'features/header/header.html'),
  loadPart('app_hero', 'features/hero/hero.html'),
  loadPart('app_services', 'features/services/services.html'),
  loadPart('app_about', 'features/about/about.html'),
  loadPart('app_gallery', 'features/gallery/gallery.html'),
  loadPart('app_location', 'features/location/location.html'),
  loadPart('app_footer', 'features/footer/footer.html'),
]).then(() => {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header?.classList.add("lg:shadow-md");
    } else {
      header?.classList.remove("lg:shadow-md");
    }
  });

  const galleryScript = document.createElement('script');
  galleryScript.src = 'features/gallery/gallery.js';
  document.body.appendChild(galleryScript);

  const servicesScript = document.createElement('script');
  servicesScript.src = 'features/services/services.js';
  document.body.appendChild(servicesScript);

  const banner = document.getElementById('cookie-banner');
  const accept = document.getElementById('accept-cookies');
  const deny = document.getElementById('deny-cookies');

  const enableCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.classList.add('opacity-0');
    setTimeout(() => banner.remove(), 300);
    loadExternalScripts(); // 🔁 Load now
  };

  const denyCookies = () => {
    localStorage.setItem('cookieConsent', 'denied');
    banner.classList.add('opacity-0');
    setTimeout(() => banner.remove(), 300);
  };

  // On page load
  const consent = localStorage.getItem('cookieConsent');
  if (consent === 'accepted') {
    loadExternalScripts();
    banner.remove();
  } else if (consent === 'denied') {
    banner.remove();
  }

  accept.addEventListener('click', enableCookies);
  deny.addEventListener('click', denyCookies);

  function loadGoogleMap() {
    const placeholder = document.getElementById('map-placeholder');
    if (!placeholder) return;

    const iframe = document.createElement('iframe');
    iframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2357.6025036080773!2d20.47951927719524!3d53.778763342280484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46e27f9c7a3c87ff%3A0xdeafa820ea0263bf!2sGabinet%20Specjalistycznej%20Piel%C4%99gnacji%20St%C3%B3p%20i%20D%C5%82oni%20Agnieszka%20Sawczuk!5e0!3m2!1spl!2spl!4v1752523279917!5m2!1spl!2spl";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    placeholder.replaceWith(iframe);
  }


  function loadExternalScripts() {
    loadGoogleMap();
  }
});
