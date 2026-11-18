/* NOTEDEBOOKPRO — interações mínimas e acessíveis */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURAÇÃO — altere apenas este bloco com os dados reais
     ------------------------------------------------------------------ */
  var SITE = {
    whatsapp: "5511983112985", // DDI + DDD + número, somente dígitos
    whatsappDisplay: "(11) 98311-2985",
    phone: "+5511983112985",
    email: "contato@notedebookpro.com.br",
    city: "São Paulo — SP",
    addressLine: "R. José da Rocha Mendes Filho, 42 — Vila Santo Estefano",
    postalCode: "04153-090",
    hours: "Segunda a sexta, 10h às 19h · Sábado, 10h às 15h",
    googleReviews: "https://www.google.com/maps/place/NOTEDEBOOKPRO+Assist%C3%AAncia+T%C3%A9cnica+Notebook/@-23.6278275,-46.6275078,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce5b03f3082e61:0xbb389266ebc936fd!8m2!3d-23.6278275!4d-46.6275078!16s%2Fg%2F11cspb701c",
    google: "https://share.google/nBmNjDC6KhPjGCNu9",
    maps: "https://maps.app.goo.gl/u78CFtdxXBtTxz5AA",
    instagram: "https://www.instagram.com/notedebookpro"
  };

  var WA_MESSAGES = {
    default: "Olá! Gostaria de solicitar um orçamento para meu notebook.",
    diagnostico: "Olá! Preciso de um diagnóstico técnico para meu notebook.",
    placa: "Olá! Preciso de avaliação para reparo de placa-mãe do meu notebook.",
    bga: "Olá! Gostaria de falar sobre reparo de chipset/BGA do meu notebook.",
    video: "Olá! Meu notebook está com problema de vídeo. Podem avaliar?",
    carga: "Olá! Meu notebook não está carregando. Podem avaliar?",
    preventiva: "Olá! Gostaria de agendar uma manutenção preventiva do meu notebook.",
    upgrade: "Olá! Quero um orçamento para upgrade de SSD/memória do meu notebook.",
    contato: "Olá! Vim pelo site e gostaria de falar com a equipe."
  };

  function waLink(key) {
    var msg = WA_MESSAGES[key] || WA_MESSAGES.default;
    return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  /* Aplica configuração em links e textos */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var key = el.getAttribute("data-wa") || "default";
    el.setAttribute("href", waLink(key));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  document.querySelectorAll('[data-site="whatsapp"]').forEach(function (el) {
    el.textContent = SITE.whatsappDisplay;
    if (el.tagName === "A") el.setAttribute("href", "tel:" + SITE.phone);
  });
  document.querySelectorAll('[data-site="whatsapp-link"]').forEach(function (el) {
    el.setAttribute("href", waLink("contato"));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll('[data-site="email"]').forEach(function (el) {
    el.textContent = SITE.email;
    if (el.tagName === "A") {
      el.setAttribute("href", "mailto:" + SITE.email);
    } else {
      var mailLink = el.closest('a[href^="mailto:"]');
      if (mailLink) mailLink.setAttribute("href", "mailto:" + SITE.email);
    }
  });
  document.querySelectorAll('[data-site="city"]').forEach(function (el) {
    el.textContent = SITE.city;
  });
  document.querySelectorAll('[data-site="address"]').forEach(function (el) {
    el.textContent = SITE.addressLine;
  });
  document.querySelectorAll('[data-site="hours"]').forEach(function (el) {
    el.textContent = SITE.hours;
  });
  document.querySelectorAll('[data-site="google-reviews"]').forEach(function (el) {
    el.setAttribute("href", SITE.googleReviews);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll('[data-site="instagram"]').forEach(function (el) {
    el.setAttribute("href", SITE.instagram);
  });
  document.querySelectorAll('[data-site="google"]').forEach(function (el) {
    el.setAttribute("href", SITE.google);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll('[data-site="maps"]').forEach(function (el) {
    el.setAttribute("href", SITE.maps);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Header com estado ao rolar */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Menu mobile */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("menu-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000) setOpen(false);
    });
  }

  /* Reveal on scroll */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* FAQ: mantém apenas uma resposta aberta */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* Mapa de regiões: pino e botão do mesmo bairro se realçam juntos */
  var regionTargets = document.querySelectorAll("[data-region]");
  if (regionTargets.length) {
    var clearRegions = function () {
      regionTargets.forEach(function (el) {
        el.classList.remove("is-active");
      });
    };
    var highlightRegion = function (slug) {
      clearRegions();
      regionTargets.forEach(function (el) {
        if (el.getAttribute("data-region") === slug) el.classList.add("is-active");
      });
    };
    regionTargets.forEach(function (el) {
      var slug = el.getAttribute("data-region");
      ["mouseenter", "focus"].forEach(function (type) {
        el.addEventListener(type, function () {
          highlightRegion(slug);
        });
      });
      ["mouseleave", "blur"].forEach(function (type) {
        el.addEventListener(type, clearRegions);
      });
    });
  }

  /* Formulário → WhatsApp (sem backend) */
  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var data = new FormData(contactForm);
      var lines = [
        "Olá! Gostaria de solicitar uma avaliação técnica.",
        "",
        "Nome: " + (data.get("nome") || "—"),
        "Notebook: " + (data.get("modelo") || "—"),
        "Serviço de interesse: " + (data.get("servico") || "—"),
        "",
        "Descrição do problema:",
        data.get("mensagem") || "—"
      ];
      var url = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      var feedback = document.querySelector("[data-form-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = "Abrimos o WhatsApp com sua mensagem. Se a janela não abriu, use o botão de WhatsApp nesta página.";
      }
    });
  }
})();
