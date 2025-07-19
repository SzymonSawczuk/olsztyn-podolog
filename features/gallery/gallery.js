const PATH = "data/gallery/min/";
const PATH_MAX = "data/gallery/max/";
const MD_MEDIA_QUERY = window.matchMedia("(min-width: 768px)");

function loadPictures() {
  return fetch("data/pictures.txt")
    .then(response => response.text())
    .then(text => text.split("\n").filter(line => line !== ""))
    .then(lines => lines.map(line => PATH + line));
}

const imageTemplate = (sliceIndex, pictureIndex, imgPath) => {
  return `<a class="grid-${sliceIndex}${pictureIndex} h-100 will-change-transform parallax" href = "${PATH_MAX}${imgPath.split('/').at(-1)}">
            <img src="${imgPath}" class="h-[100%] object-cover
              border border-black/20 lg:border-transparent
              backdrop-blur-none lg:backdrop-blur-xs
              ring-0 lg:ring-1 lg:ring-white/10
              shadow-none lg:shadow-lg
              transition-transform duration-300 transform hover:scale-102
              rounded-2xl opacity-90 cursor-pointer" alt="${imgPath.split('.')[0]}" width="300"/>
          </div>`;
};

loadPictures().then(pictures => {
  const firstSlice = document.getElementById("first-slice");
  const secondSlice = document.getElementById("second-slice");
  const thirdSlice = document.getElementById("third-slice");

  const slices = [firstSlice, secondSlice, thirdSlice];

  const slicesLength = slices.length;
  let lastIndex = 0;
  for (let index = 0; index < slicesLength; index++) {
    const picturesLength = pictures.length;
    pictures.slice(lastIndex, lastIndex = lastIndex + (picturesLength / slicesLength)).forEach((picture, picture_index) => {
      slices[index].innerHTML += imageTemplate(index / slicesLength, picture_index, picture);
    });
  }

  function applyParallaxOnScroll() {
    if (!MD_MEDIA_QUERY.matches) {
      resetTransform(firstSlice);
      resetTransform(secondSlice);
      resetTransform(thirdSlice);
      return;
    }

    const gallerySection = document.getElementById("gallery");

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

  window.addEventListener("scroll", applyParallaxOnScroll);
  MD_MEDIA_QUERY.addEventListener("change", applyParallaxOnScroll);

});

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
