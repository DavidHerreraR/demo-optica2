(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (!navToggle || !navMenu) return;

  const navLinks = navMenu.querySelectorAll("a");

  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const openMenu = () => {
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menu");
    navMenu.classList.add("is-open");
    document.body.classList.add("nav-open");
  };

  navToggle.addEventListener("click", () => {
    navToggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1024px)").matches) closeMenu();
  });
})();

(function () {
  const grid = document.querySelector(".cards-grid");
  const store = document.querySelector(".card-x-details");
  const cards = [...document.querySelectorAll(".card-x[data-card]")];
  if (!grid || !store || !cards.length) return;

  const DEFAULT_OPEN = "examen-visual";
  let openId = null;

  const panelOf = (card) => document.getElementById(card.querySelector(".card-x-toggle").getAttribute("aria-controls"));
  const cardById = (id) => cards.find((card) => card.dataset.card === id);

  const lastInRow = (card) => {
    const top = card.offsetTop;
    let last = card;
    cards.forEach((candidate) => {
      if (Math.abs(candidate.offsetTop - top) < 4) last = candidate;
    });
    return last;
  };

  const setAria = (card, open) => {
    const button = card.querySelector(".card-x-toggle");
    const name = card.querySelector("h3")?.textContent || "este servicio";
    card.setAttribute("aria-expanded", String(open));
    if (button) {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", (open ? "Cerrar informacion de " : "Ver mas sobre ") + name);
    }
  };

  const openCard = (card) => {
    const panel = panelOf(card);
    if (!panel) return;
    lastInRow(card).after(panel);
    setAria(card, true);
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-open")));
    openId = card.dataset.card;
  };

  const closeCard = (card, instant) => {
    const panel = panelOf(card);
    if (!panel) return;
    panel.classList.remove("is-open");
    setAria(card, false);
    if (openId === card.dataset.card) openId = null;
    if (instant) {
      store.appendChild(panel);
      return;
    }
    const onEnd = (event) => {
      if (event.propertyName === "grid-template-rows" && !panel.classList.contains("is-open")) {
        store.appendChild(panel);
        panel.removeEventListener("transitionend", onEnd);
      }
    };
    panel.addEventListener("transitionend", onEnd);
  };

  const toggle = (card) => {
    const isOpen = card.getAttribute("aria-expanded") === "true";
    cards.forEach((candidate) => {
      if (candidate !== card && candidate.getAttribute("aria-expanded") === "true") closeCard(candidate, true);
    });
    isOpen ? closeCard(card, false) : openCard(card);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => toggle(card));
    const button = card.querySelector(".card-x-toggle");
    if (button) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggle(card);
      });
    }
  });

  const defaultCard = cardById(DEFAULT_OPEN);
  if (defaultCard) openCard(defaultCard);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!openId) return;
      const card = cardById(openId);
      if (card) lastInRow(card).after(panelOf(card));
    }, 150);
  });
})();

function trackEvent(eventName, params = {}) {
  // Google Tag Manager:
  // window.dataLayer = window.dataLayer || [];
  // window.dataLayer.push({ event: eventName, ...params });

  // Google Analytics 4 / Google Ads:
  // if (typeof gtag === "function") { gtag("event", eventName, params); }
  // if (typeof gtag === "function") { gtag("event", "conversion", { send_to: "AW-XXXX/CONVERSION_LABEL" }); }

  // Meta Pixel:
  // if (typeof fbq === "function") { fbq("track", "Lead"); fbq("trackCustom", eventName, params); }

  return { eventName, params };
}

function whatsapp_click(params) {
  return trackEvent("whatsapp_click", params);
}

function phone_click(params) {
  return trackEvent("phone_click", params);
}

function maps_click(params) {
  return trackEvent("maps_click", params);
}

function social_click(params) {
  return trackEvent("social_click", params);
}

function lead_submit(params) {
  return trackEvent("lead_submit", params);
}

(function () {
  const handlers = {
    whatsapp: whatsapp_click,
    phone: phone_click,
    maps: maps_click,
    social: social_click,
  };

  document.querySelectorAll("[data-evt]").forEach((element) => {
    element.addEventListener("click", () => {
      const handler = handlers[element.getAttribute("data-evt")];
      if (!handler) return;
      handler({
        location: element.closest("section, header, footer")?.id || "global",
        href: element.getAttribute("href") || "",
      });
    });
  });

  document.querySelector("#lead-form")?.addEventListener("submit", () => lead_submit({ form: "contacto" }));

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
