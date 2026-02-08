const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// Año footer
$("#year").textContent = new Date().getFullYear();

// ====== Mobile nav toggle ======
const toggleBtn = $(".nav-toggle");
const menu = $("#menu");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  toggleBtn.setAttribute("aria-expanded", String(open));
  $(".sr-only", toggleBtn).textContent = open ? "Cerrar menú" : "Abrir menú";
}

toggleBtn.addEventListener("click", () => {
  const isOpen = menu.classList.contains("is-open");
  setMenu(!isOpen);
});

$$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

document.addEventListener("click", (e) => {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  if (!isMobile) return;
  const clickedInside =
    e.target.closest(".site-nav") || e.target.closest(".nav-toggle");
  if (!clickedInside) setMenu(false);
});

// ====== WhatsApp base number (toma el del botón principal) ======
function getWaBase() {
  const wa = $("#waMain");
  if (!wa) return "https://wa.me/521XXXXXXXXXX";
  return wa.href.split("?")[0];
}

function openWhatsAppQuote(productName, optionValue = "") {
  const base = getWaBase();
  const extra = optionValue ? ` (${optionValue})` : "";
  const text =
    `Hola SweetHome, quiero cotizar: ${productName}${extra}. ` +
    `¿Me dices precio, disponibilidad y tiempo de entrega?`;
  const url = `${base}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

// Botones cotizar
$$(".js-quote").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const name = card?.dataset?.name || "un producto";
    const select = card?.querySelector(".js-option");
    const option = select?.value?.trim() || "";
    openWhatsAppQuote(name, option);
  });
});

// ====== Modal / Lightbox con carrusel ======
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalImg = $("#modalImg");
const dots = $("#modalDots");

let currentImages = [];
let currentIndex = 0;

function parseImages(card) {
  const raw = (card.dataset.images || "").trim();
  return raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

function renderDots() {
  dots.innerHTML = "";
  currentImages.forEach((_, idx) => {
    const b = document.createElement("button");
    b.className = "dot" + (idx === currentIndex ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Ir a foto ${idx + 1}`);
    b.addEventListener("click", () => {
      currentIndex = idx;
      renderSlide();
    });
    dots.appendChild(b);
  });
}

function renderSlide() {
  if (!currentImages.length) return;
  const src = currentImages[currentIndex];
  modalImg.src = src;
  modalImg.alt = `${modalTitle.textContent} - foto ${currentIndex + 1}`;
  renderDots();
}

function openModal(title, images) {
  currentImages = images;
  currentIndex = 0;
  modalTitle.textContent = title || "Fotos";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderSlide();
}

function closeModal() {
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

// Abrir modal con "Ver fotos"
$$(".js-photos").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const title = card?.dataset?.name || "Fotos";
    const imgs = parseImages(card);
    if (!imgs.length) return;
    openModal(title, imgs);
  });
});

// Navegación modal
$(".modal-nav.next").addEventListener("click", nextSlide);
$(".modal-nav.prev").addEventListener("click", prevSlide);

// Cerrar modal (X o fondo)
modal.addEventListener("click", (e) => {
  const close = e.target?.dataset?.close === "true";
  if (close) closeModal();
});

// Teclado (ESC / flechas)
document.addEventListener("keydown", (e) => {
  const open = modal.classList.contains("is-open");
  if (!open) return;

  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") nextSlide();
  if (e.key === "ArrowLeft") prevSlide();
});
