const SEPARATOR = ';';

function loadPricing() {
  return fetch("/src/data/pricing.txt")
    .then(response => response.text())
    .then(text => text.split('\n'))
    .then(lines => {
      const col_names = lines[0].split(SEPARATOR);
      return lines.slice(1).map(line => {
        if (line === '') return;
        const values = line.split(SEPARATOR);
        const row = {};
        col_names.forEach((col, index) => {
          row[col] = values[index];
        });
        return row;
      }).filter(Boolean);
    });
}

function revealOnScroll() {
  const boxes = document.querySelectorAll(".service-box");
  const windowHeight = window.innerHeight;
  boxes.forEach(box => {
    const rect = box.getBoundingClientRect();
    if (rect.top < windowHeight - 100) {
      box.classList.remove("opacity-0", "translate-y-8");
      box.classList.add("opacity-100", "translate-y-0");
    }
  });
}

function capitalize(word) {
  if (!word) return '';
  return word[0].toUpperCase() + word.slice(1);
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

const serviceTemplate = (name, desc, price) => `
  <div class="bg-white lg:bg-white/10
              border border-black/20 lg:border-transparent
              backdrop-blur-none lg:backdrop-blur-md
              ring-0 lg:ring-1 lg:ring-white/10
              shadow-none lg:shadow-md hover:lg:shadow-lg
              rounded-2xl p-6 flex flex-col justify-between h-full service-box
              transition-transform duration-700 ease-in-out  transform opacity-0 translate-y-8">
    <div class="mb-4">
      <h3 class="text-xl font-semibold mb-2 text-black">${capitalize(name)}</h3>
      <p class="text-gray-700 min-h-[3rem]">${desc ? capitalize(desc) : '&nbsp;'}</p>
    </div>
    <div class="text-[#C11C84] opacity-40 font-bold text-lg mt-auto">${price}</div>
  </div>
`;

const groupHeaderTemplate = (groupName, groupId) => `
  <button
    class="w-full text-left text-2xl font-bold text-gray-700 mt-10 mb-4 col-span-full border-b border-gray-600 pb-2 md:cursor-default md:pointer-events-none"
    onclick="toggleGroup('${groupId}')">
    ${capitalize(groupName)}
    <span class="md:hidden float-right text-pink-400 transition-transform" id="${groupId}-icon">+</span>
  </button>
`;

const groupGridTemplate = (cardsHTML, groupId) => `
  <div id="${groupId}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden transition-all duration-500 md:max-h-none max-h-0 md:p-5">
    ${cardsHTML}
  </div>
`;

let allServices = {};

function renderPricing(filter = "") {
  const pricing = document.getElementById("pricing");
  pricing.innerHTML = "";

  Object.entries(allServices).forEach(([groupName, services]) => {
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(filter) ||
      (service.desc && service.desc.toLowerCase().includes(filter)) ||
      (service.price && service.price.toLowerCase().includes(filter))
    );

    if (filtered.length === 0) return;

    const groupId = `group-${groupName.toLowerCase()}`;
    const groupHeaderHTML = groupHeaderTemplate(groupName, groupId);
    const groupCardsHTML = filtered.map(service =>
      serviceTemplate(service.name, service.desc, service.price)
    ).join('');
    const groupGridHTML = groupGridTemplate(groupCardsHTML, groupId);

    pricing.innerHTML += groupHeaderHTML + groupGridHTML;
  });

  revealOnScroll();
}

loadPricing().then(data => {
  allServices = {};
  data.forEach(item => {
    if (!item || !item.group) return;
    const group = item.group.trim().toUpperCase();
    if (!allServices[group]) allServices[group] = [];
    allServices[group].push(item);
  });

  renderPricing();

  const searchInput = document.getElementById("pricing-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderPricing(e.target.value.toLowerCase());
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);
});

