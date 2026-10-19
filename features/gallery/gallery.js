const MD_MEDIA_QUERY = window.matchMedia("(min-width: 768px)");

const firstSlice = document.getElementById("first-slice");
const secondSlice = document.getElementById("second-slice");
const thirdSlice = document.getElementById("third-slice");

function applyParallaxOnScroll() {
  if (!MD_MEDIA_QUERY.matches) {
    resetTransform(firstSlice);
    resetTransform(secondSlice);
    resetTransform(thirdSlice);
    return;
  }

  const gallerySection = document.getElementById("galeria");

  const galleryRect = gallerySection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const scrollStart = window.scrollY + galleryRect.top;
  const scrollEnd = scrollStart + gallerySection.offsetHeight - viewportHeight;

  const scrollTop = window.scrollY;
  const clampedScroll = Math.min(Math.max(scrollTop, scrollStart), scrollEnd);
  const scrollYProgress = (clampedScroll - scrollStart) / (scrollEnd - scrollStart);

  const translateFirst = mapRange(scrollYProgress, 0, 1, 0, -200);
  const translateSecond = mapRange(scrollYProgress, 0, 1, 0, 200);
  const translateThird = mapRange(scrollYProgress, 0, 1, 0, -200);

  applyTransform(firstSlice, translateFirst);
  applyTransform(secondSlice, translateSecond);
  applyTransform(thirdSlice, translateThird);
}

window.addEventListener("scroll", applyParallaxOnScroll, { passive: true });
MD_MEDIA_QUERY.addEventListener("change", applyParallaxOnScroll);

function resetTransform(sliceElement) {
  const children = sliceElement.querySelectorAll(".parallax");
  children.forEach(child => {
    child.style.transform = `translateY(0px)`;
  });
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function applyTransform(sliceElement, translateY) {
  const children = sliceElement.querySelectorAll(".parallax");
  children.forEach(child => {
    child.style.transform = `translateY(${translateY}px)`;
  });
}
