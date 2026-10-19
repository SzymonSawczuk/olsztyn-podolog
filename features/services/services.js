function revealOnScroll() {
  const boxes = document.querySelectorAll(".service-box");
  const windowHeight = window.innerHeight;
  boxes.forEach(box => {
    const rect = box.getBoundingClientRect();
    if (rect.top < windowHeight - 100) {
      box.classList.remove("opacity-0", "translate-y-4");
      box.classList.add("opacity-100", "translate-y-0");
    }
  });
}

function toggleGroup(id) {
  const group = document.getElementById(id);
  const icon = document.getElementById(`${id}-icon`);
  if (!group || !icon) return;
  const isOpen = group.classList.contains("max-h-[2000px]");
  if (isOpen) {
    group.classList.remove("max-h-[2000px]");
    group.classList.add("max-h-0");
    icon.textContent = "+";
  } else {
    group.classList.remove("max-h-0");
    group.classList.add("max-h-[2000px]");
    icon.textContent = "−";
  }
}

function filterPricing(filter = "") {
  document.querySelectorAll("#pricing .pricing-group").forEach(group => {
    let visible = 0;
    group.querySelectorAll(".service-box").forEach(box => {
      const match = box.textContent.toLowerCase().includes(filter);
      box.style.display = match ? "" : "none";
      if (match) visible++;
    });
    group.style.display = visible ? "" : "none";
  });

  revealOnScroll();
}

const searchInput = document.getElementById("pricing-search");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    filterPricing(e.target.value.toLowerCase().trim());
  });
}

window.addEventListener("scroll", revealOnScroll, { passive: true });
window.addEventListener("load", revealOnScroll);
revealOnScroll();
