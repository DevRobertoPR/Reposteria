const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

const yearNode = $("#year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

const toggleBtn = $(".nav-toggle");
const menu = $("#menu");

function setMenu(open) {
  if (!toggleBtn || !menu) return;
  menu.classList.toggle("is-open", open);
  toggleBtn.setAttribute("aria-expanded", String(open));
  const srText = $(".sr-only", toggleBtn);
  if (srText) srText.textContent = open ? "Cerrar menú" : "Abrir menú";
}

if (toggleBtn && menu) {
  toggleBtn.addEventListener("click", () => {
    setMenu(!menu.classList.contains("is-open"));
  });

  $$(".menu a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (event) => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    if (!isMobile) return;

    const clickedInside =
      event.target.closest(".site-nav") || event.target.closest(".nav-toggle");

    if (!clickedInside) setMenu(false);
  });
}

function getWaBase() {
  const waMain = $("#waMain");
  if (!waMain) return "https://wa.me/521XXXXXXXXXX";
  return waMain.href.split("?")[0];
}

function openWhatsAppQuote(productName, optionValue = "") {
  const base = getWaBase();
  const optionText = optionValue ? ` (${optionValue})` : "";
  const text =
    `Hola Sweet Home, quiero cotizar: ${productName}${optionText}. ` +
    "¿Me compartes precio, disponibilidad y tiempo de entrega?";

  window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

$$(".js-quote").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    const productName = card?.dataset?.name || "un producto";
    const select = card?.querySelector(".js-option");
    const option = select?.value?.trim() || "";
    openWhatsAppQuote(productName, option);
  });
});

const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalImg = $("#modalImg");
const dots = $("#modalDots");
const nextButton = $(".modal-nav.next");
const prevButton = $(".modal-nav.prev");

let currentImages = [];
let currentIndex = 0;

function parseImages(card) {
  const raw = (card?.dataset?.images || "").trim();
  return raw
    ? raw
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
    : [];
}

function renderDots() {
  if (!dots) return;

  dots.innerHTML = "";

  currentImages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `dot${index === currentIndex ? " is-active" : ""}`;
    dot.setAttribute("aria-label", `Ir a foto ${index + 1}`);

    dot.addEventListener("click", () => {
      currentIndex = index;
      renderSlide();
    });

    dots.appendChild(dot);
  });
}

function renderSlide() {
  if (!modalImg || !currentImages.length) return;
  const src = currentImages[currentIndex];
  modalImg.src = src;
  modalImg.alt = `${modalTitle?.textContent || "Galería"} - foto ${currentIndex + 1}`;
  renderDots();
}

function openModal(title, images) {
  if (!modal || !modalTitle) return;

  currentImages = images;
  currentIndex = 0;
  modalTitle.textContent = title || "Fotos";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderSlide();
}

function closeModal() {
  if (!modal || !modalImg) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
  currentImages = [];
  currentIndex = 0;
  document.body.style.overflow = "";
}

function nextSlide() {
  if (!currentImages.length) return;
  currentIndex = (currentIndex + 1) % currentImages.length;
  renderSlide();
}

function prevSlide() {
  if (!currentImages.length) return;
  currentIndex =
    (currentIndex - 1 + currentImages.length) % currentImages.length;
  renderSlide();
}

$$(".js-photos").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    const title = card?.dataset?.name || "Fotos";
    const images = parseImages(card);
    if (!images.length) return;
    openModal(title, images);
  });
});

if (nextButton) nextButton.addEventListener("click", nextSlide);
if (prevButton) prevButton.addEventListener("click", prevSlide);

if (modal) {
  modal.addEventListener("click", (event) => {
    const shouldClose = event.target?.dataset?.close === "true";
    if (shouldClose) closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  const isModalOpen = modal?.classList.contains("is-open");
  if (!isModalOpen) return;

  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowRight") nextSlide();
  if (event.key === "ArrowLeft") prevSlide();
});

const sections = $$("main section[id]");
const navLinks = $$('.menu a[href^="#"]');

if (sections.length && navLinks.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const isMatch = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", isMatch);
        });
      });
    },
    {
      threshold: 0.35,
      rootMargin: "-20% 0px -50% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}
