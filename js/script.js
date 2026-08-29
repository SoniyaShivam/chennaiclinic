/* =========================================================================
   CarePlus Clinic — script.js
   Vanilla JavaScript only. No dependencies.
   Modules: mobile nav, active nav state, FAQ accordion,
            scroll-to-top, smooth scroll, appointment form validation.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initActiveNavState();
  initFaqAccordion();
  initScrollToTop();
  initSmoothScroll();
  initAppointmentForm();
  initServiceFilter();
});

/* -------------------------------------------------------------------------
   Mobile navigation
   - toggles the menu
   - closes on link click, outside click, and Escape
   - keeps aria-expanded in sync for accessibility
   ------------------------------------------------------------------------- */
function initMobileNav() {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (!toggle || !links) return;

  function openMenu() {
    links.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return links.classList.contains("is-open");
  }

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", function (event) {
    if (!isOpen()) return;
    var clickedInsideMenu = links.contains(event.target);
    var clickedToggle = toggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && isOpen()) {
      closeMenu();
    }
  });
}

/* -------------------------------------------------------------------------
   Highlights the current page in the nav using aria-current
   ------------------------------------------------------------------------- */
function initActiveNavState() {
  var currentPath = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a[href]").forEach(function (link) {
    var linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/* -------------------------------------------------------------------------
   FAQ accordion
   - single-open behaviour per list
   - fully keyboard accessible (native <button>)
   ------------------------------------------------------------------------- */
function initFaqAccordion() {
  var faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var isOpenNow = item.classList.contains("is-open");

      faqItems.forEach(function (otherItem) {
        otherItem.classList.remove("is-open");
        var otherQuestion = otherItem.querySelector(".faq-question");
        if (otherQuestion) otherQuestion.setAttribute("aria-expanded", "false");
      });

      if (!isOpenNow) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* -------------------------------------------------------------------------
   Scroll-to-top button
   ------------------------------------------------------------------------- */
function initScrollToTop() {
  var button = document.querySelector(".scroll-top");
  if (!button) return;

  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 480) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    },
    { passive: true }
  );

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* -------------------------------------------------------------------------
   Smooth scroll for on-page anchor links (e.g. "#services", "#faq")
   ------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var targetId = link.getAttribute("href");
    if (targetId.length < 2) return;

    var target = document.querySelector(targetId);
    if (!target) return;

    link.addEventListener("click", function (event) {
      event.preventDefault();
      var headerOffset = 90;
      var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

/* -------------------------------------------------------------------------
   Appointment form validation (contact.html)
   - Frontend-only demo: no data is sent anywhere.
   ------------------------------------------------------------------------- */
function initAppointmentForm() {
  var form = document.getElementById("appointment-form");
  if (!form) return;

  var successBox = document.getElementById("form-success");

  var validators = {
    fullName: function (value) {
      return value.trim().length >= 2 ? "" : "Please enter your full name.";
    },
    phone: function (value) {
      var digits = value.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Please enter a valid phone number.";
    },
    email: function (value) {
      if (!value.trim()) return "";
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value.trim()) ? "" : "Please enter a valid email address.";
    },
    service: function (value) {
      return value ? "" : "Please choose a service.";
    },
    preferredDate: function (value) {
      if (!value) return "Please choose a preferred date.";
      var chosen = new Date(value + "T00:00:00");
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today ? "" : "Please choose a date from today onward.";
    },
    preferredTime: function (value) {
      return value ? "" : "Please choose a preferred time.";
    }
  };

  function showError(field, message) {
    var group = field.closest(".form-group");
    if (!group) return;
    var errorEl = group.querySelector(".field-error");
    if (message) {
      group.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
    } else {
      group.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(field) {
    var validator = validators[field.name];
    if (!validator) return true;
    var message = validator(field.value);
    showError(field, message);
    return message === "";
  }

  Object.keys(validators).forEach(function (name) {
    var field = form.elements[name];
    if (!field) return;
    field.addEventListener("blur", function () {
      validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.closest(".form-group").classList.contains("has-error")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var isFormValid = true;
    Object.keys(validators).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var fieldIsValid = validateField(field);
      if (!fieldIsValid) isFormValid = false;
    });

    if (!isFormValid) {
      var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstError) firstError.focus();
      if (successBox) successBox.classList.remove("is-visible");
      return;
    }

    if (successBox) {
      successBox.classList.add("is-visible");
      successBox.setAttribute("tabindex", "-1");
      successBox.focus();
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.reset();
  });
}

/* -------------------------------------------------------------------------
   Optional service filter (services.html)
   Filters visible service detail sections by category buttons, if present.
   ------------------------------------------------------------------------- */
function initServiceFilter() {
  var filterBar = document.querySelector(".service-filter");
  if (!filterBar) return;

  var buttons = filterBar.querySelectorAll("[data-filter]");
  var services = document.querySelectorAll("[data-category]");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");

      var filter = button.getAttribute("data-filter");

      services.forEach(function (service) {
        var matches = filter === "all" || service.getAttribute("data-category") === filter;
        service.style.display = matches ? "" : "none";
      });
    });
  });
}
