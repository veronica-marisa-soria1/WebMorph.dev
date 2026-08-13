const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
const currentYear = document.querySelector("#current-year");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const setHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

// El texto para lector de pantalla quedaba fijo en "Abrir menú" incluso con el
// menú abierto, así que anunciaba la acción contraria a la disponible.
const setMenuState = (isOpen) => {
  navToggle.setAttribute("aria-expanded", String(isOpen));

  const label = navToggle.querySelector(".sr-only");

  if (label) {
    label.textContent = isOpen ? "Cerrar menú" : "Abrir menú";
  }
};

const closeMenu = () => {
  if (!navToggle || !navMenu) {
    return;
  }

  navMenu.classList.remove("is-open");
  setMenuState(false);
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    setMenuState(navMenu.classList.toggle("is-open"));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || href === "#") {
      return;
    }

    // getElementById en vez de querySelector: un hash con caracteres que no
    // son válidos como selector CSS haría throw y rompería el listener.
    const target = document.getElementById(href.slice(1));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    // preventDefault también cancelaba la actualización del hash: no había
    // deep links (#proyectos no era compartible) ni funcionaba el botón Atrás.
    history.pushState(null, "", href);

    // scrollIntoView mueve la vista pero no el foco. Sin esto, quien navega
    // por teclado sigue tabulando desde el header y el skip link no sirve.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

// Al usar Atrás/Adelante el navegador no dispara el click, así que hay que
// llevar la vista al destino a mano.
window.addEventListener("popstate", () => {
  const target = window.location.hash
    ? document.getElementById(window.location.hash.slice(1))
    : null;

  if (target) {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }
});

const setActiveNavLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

const observedSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0.01,
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const validators = {
  name: (value) => (value.trim() ? "" : "Ingresá tu nombre."),
  email: (value) => {
    if (!value.trim()) {
      return "Ingresá tu email.";
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? ""
      : "Ingresá un email válido.";
  },
  message: (value) => (value.trim() ? "" : "Escribí un mensaje."),
};

const setFieldState = (field, message) => {
  const error = document.querySelector(`#${field.id}-error`);
  const hasError = Boolean(message);

  field.classList.toggle("is-invalid", hasError);
  field.classList.toggle("is-valid", !hasError && Boolean(field.value.trim()));
  field.setAttribute("aria-invalid", String(hasError));

  // textContent, no innerHTML: los mensajes son texto plano y así el nodo no
  // queda como sink de HTML si alguna vez incluyen datos del usuario.
  if (error) {
    error.textContent = message;
  }
};

const validateField = (field) => {
  const validator = validators[field.name];

  if (!validator) {
    return true;
  }

  const message = validator(field.value);
  setFieldState(field, message);
  return !message;
};

// Endpoint del formulario de contacto.
// Vacío: se usa el fallback mailto, que abre el cliente de correo del visitante
// con el mensaje ya redactado. Para activar el envío en segundo plano, pegá acá
// la URL que entrega Formspree (https://formspree.io) o Web3Forms.
const CONTACT_ENDPOINT = "";
const CONTACT_EMAIL = "soriav449veronica@gmail.com";

const setFormStatus = (message, state = "") => {
  formStatus.textContent = message;
  formStatus.className = state ? `form-status ${state}` : "form-status";
};

const buildMailtoUrl = ({ name, email, message }) => {
  const subject = `Contacto desde Web Morph — ${name}`;
  const body = `${message}\n\n—\n${name}\n${email}`;

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
};

if (contactForm && formStatus) {
  const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
  const submitButton = contactForm.querySelector('button[type="submit"]');

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      setFormStatus("");
    });

    field.addEventListener("blur", () => validateField(field));
  });

  const setBusy = (isBusy) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Enviando..." : "Enviar";
  };

  const resetFields = () => {
    contactForm.reset();
    fields.forEach((field) => {
      field.classList.remove("is-valid", "is-invalid");
      field.setAttribute("aria-invalid", "false");
    });
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // filter, no every: every corta en el primer campo inválido y dejaría los
    // demás sin marcar, contradiciendo el mensaje "los campos marcados".
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length) {
      setFormStatus("Revisá los campos marcados antes de enviar.", "is-error");
      invalidFields[0].focus();
      return;
    }

    const data = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      message: contactForm.elements.message.value.trim(),
    };

    // Sin endpoint configurado abrimos el cliente de correo del visitante.
    // No afirmamos que el mensaje se envió: el envío depende de que la persona
    // lo confirme en su propio cliente.
    if (!CONTACT_ENDPOINT) {
      window.location.href = buildMailtoUrl(data);
      setFormStatus(
        `Abrimos tu cliente de correo con el mensaje listo para enviar. Si no se abrió, escribime a ${CONTACT_EMAIL}.`
      );
      return;
    }

    setBusy(true);
    setFormStatus("Enviando mensaje...");

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió ${response.status}`);
      }

      resetFields();
      setFormStatus("Mensaje enviado. Te respondo a la brevedad.", "is-success");
    } catch (error) {
      console.error("Error al enviar el formulario de contacto:", error);
      setFormStatus(
        `No se pudo enviar el mensaje. Escribime directamente a ${CONTACT_EMAIL}.`,
        "is-error"
      );
    } finally {
      setBusy(false);
    }
  });
}
// ─── Toggle modo oscuro / claro ───────────────────────────────────────────────
// Pegá este bloque al final de main.js
// ─────────────────────────────────────────────────────────────────────────────

const themeToggle = document.querySelector("#theme-toggle");
const htmlEl = document.documentElement;

// 1. Determinar tema inicial:
//    - Primero lee localStorage (preferencia del usuario)
//    - Si no hay preferencia guardada, usa prefers-color-scheme del sistema
const getSavedTheme = () => localStorage.getItem("wm-theme");

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

const applyTheme = (theme) => {
  htmlEl.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
    );
  }
};

// Aplicar tema al cargar la página (antes de que se pinte, evita flash)
const initialTheme = getSavedTheme() || getSystemTheme();
applyTheme(initialTheme);

// 2. Al hacer click en el toggle: cambiar y guardar en localStorage
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = htmlEl.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("wm-theme", next);
  });
}

// 3. Si el usuario cambia la preferencia del sistema mientras está en la página,
//    actualizar solo si no tiene preferencia guardada manualmente
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (!getSavedTheme()) {
      applyTheme(e.matches ? "light" : "dark");
    }
  });
  // ─── Efecto Typewriter en el hero ─────────────────────────────────────────────
// Pegá este bloque al final de main.js
// ─────────────────────────────────────────────────────────────────────────────

const typewriterEl = document.querySelector("#typewriter-text");

if (typewriterEl && !prefersReducedMotion) {
  const phrases = [
    "Desarrolladora de Software",
    "Estudiante de Tecnicatura en Sistemas",
    "Creadora de Web Morph",
    "Programadora Python · Django",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const WRITE_SPEED  = 55;   // ms entre cada letra al escribir
  const DELETE_SPEED = 28;   // ms entre cada letra al borrar
  const PAUSE_END    = 2000; // ms de pausa cuando la frase está completa
  const PAUSE_START  = 400;  // ms de pausa antes de empezar a escribir la siguiente

  const tick = () => {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      // Borrar una letra
      charIndex--;
      typewriterEl.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Terminó de borrar → pasar a la siguiente frase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }

      setTimeout(tick, DELETE_SPEED);
    } else {
      // Escribir una letra
      charIndex++;
      typewriterEl.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Frase completa → pausa y empezar a borrar
        isDeleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }

      setTimeout(tick, WRITE_SPEED);
    }
  };

  // Pequeña pausa inicial antes de arrancar
  setTimeout(tick, 800);

} else if (typewriterEl && prefersReducedMotion) {
  // Sin animación: mostrar la primera frase directamente
  typewriterEl.textContent = "Desarrolladora de Software";
}
// ─── Filtro de proyectos ──────────────────────────────────────────────────────
// Pegá este bloque al final de main.js
// ─────────────────────────────────────────────────────────────────────────────

const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const projectEmpty = document.querySelector("#project-empty");

const getCardTags = (card) =>
  (card.dataset.tags || "").split(/\s+/).filter(Boolean);

if (filterBtns.length && projectCards.length) {
  const applyFilter = (filter) => {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      // includes sobre el array de tokens, no sobre el string completo:
      // con substring, el filtro "web" tambien matchearia un tag "webpack".
      const matches = filter === "all" || getCardTags(card).includes(filter);

      card.classList.toggle("is-hidden", !matches);

      if (matches) {
        visibleCount += 1;
      }
    });

    if (projectEmpty) {
      projectEmpty.hidden = visibleCount > 0;
    }
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      applyFilter(btn.dataset.filter);
    });
  });
}

// ─── Animaciones al hacer scroll (fade-up, fade-in, slide) ───────────────────
// Pegá este bloque al final de main.js
// ─────────────────────────────────────────────────────────────────────────────

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const animatables = document.querySelectorAll(
    ".animate-fade-up, .animate-fade-in, .animate-slide-left, .animate-slide-right"
  );

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.style.getPropertyValue("--anim-delay") || "0ms";
        el.style.transitionDelay = delay;
        el.classList.add("is-visible");
        animObserver.unobserve(el);
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  animatables.forEach((el) => animObserver.observe(el));
} else {
  document
    .querySelectorAll(
      ".animate-fade-up, .animate-fade-in, .animate-slide-left, .animate-slide-right"
    )
    .forEach((el) => el.classList.add("is-visible"));
}