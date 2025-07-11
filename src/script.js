async function loadPart(id, url) {
  const el = document.getElementById(id);
  if (el) {
    const res = await fetch(url);
    el.innerHTML = await res.text();
  }
}

loadPart('app_header', '/src/features/header.html');
loadPart('app_hero', '/src/features/hero.html');
loadPart('app_services', '/src/features/services/services.html');

window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 10) {
    header?.classList.add("lg:shadow-md");
  } else {
    header?.classList.remove("lg:shadow-md");
  }
});
