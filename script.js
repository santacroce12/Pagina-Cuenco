$(document).ready(function () {
  /* ================= NAVBAR ================= */
  $(window).on("scroll", function () {
    $(".navbar").toggleClass("navbar-scrolled", $(window).scrollTop() > 50);
  });

  /* ================= SMOOTH SCROLL ================= */
  $('a[href*="#"]').on("click", function (e) {
    if (
      $(this).attr("href").startsWith("#") &&
      !$(this).hasClass("no-scroll")
    ) {
      e.preventDefault();
      $("html, body").animate(
        { scrollTop: $($(this).attr("href")).offset().top - 70 },
        500,
        "linear",
      );
    }
  });

  /* ================= ANIMACIONES ON SCROLL ================= */
  function initScrollAnimations() {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
      );

      document
        .querySelectorAll(
          ".about-card, .solution-card, .market-item, .partner-item",
        )
        .forEach((el) => observer.observe(el));
    } else {
      function animateElements() {
        $(".about-card, .solution-card, .market-item, .partner-item").each(
          function () {
            const position = $(this).offset().top;
            const scroll = $(window).scrollTop();
            const windowHeight = $(window).height();

            if (
              scroll + windowHeight - 100 > position &&
              !$(this).hasClass("animate")
            ) {
              $(this).addClass("animate");
            }
          },
        );
      }
      $(window).on("scroll", animateElements);
      animateElements();
    }
  }
  initScrollAnimations();

  /* ================= REDIRECCIONES SOLUCIONES ================= */
  const solutionUrls = {
    iot: "soluciones/IoSmartCity.html",
    movilidad: "soluciones/movilidadYseguridad.html",
    comunicaciones: "soluciones/comunicacionesYconectividad.html",
    ciberseguridad: "soluciones/ciberseguridad.html",
  };

  $(".solution-card, .solution-link, .explore-btn").on("click", function (e) {
    e.stopPropagation();
    const solution = $(this).closest(".solution-card").data("solution");
    if (solutionUrls[solution]) window.location.href = solutionUrls[solution];
  });

  $(".footer-links a[data-solution]").on("click", function (e) {
    e.preventDefault();
    const solution = $(this).data("solution");
    if (solutionUrls[solution]) window.location.href = solutionUrls[solution];
  });

  $(".footer-links:eq(1) a:eq(0)").attr("data-solution", "iot");
  $(".footer-links:eq(1) a:eq(1)").attr("data-solution", "movilidad");
  $(".footer-links:eq(1) a:eq(2)").attr("data-solution", "comunicaciones");
  $(".footer-links:eq(1) a:eq(3)").attr("data-solution", "ciberseguridad");

  /* ================= REDIRECCIONES PARTNERS ================= */
  const partnerUrls = {
    "cespicolor.png": "https://www.cespi.unlp.edu.ar/",
    "ccontrol.png": "https://www.c-control.com/es/",
    "dexcolor.png": "https://www.dexmanager.com/",
    "hanwafin.png": "https://hanwhavisionlatam.com/",
    "net2.png": "https://www.net2phone.com/es-ar/",
    "Orbith.png": "https://www.orbith.com/ar/",
    "Rlinkcolor.png": "http://www.rlink.com.ar/",
    "hikvision.png": "https://www.hikvision.com/es-la/",
    "Urbanly.png": "https://urbanly.org/",
  };

  $(".partner-item").each(function () {
    const img = $(this).find("img");
    const filename = img.attr("src").split("/").pop();

    if (partnerUrls[filename]) {
      img.wrap(
        $("<a>", {
          href: partnerUrls[filename],
          target: "_blank",
          rel: "noopener noreferrer",
        }),
      );
    }
  });

  /* ================= PAUSAR CARRUSEL EN HOVER ================= */
  $(".partners-carousel").on("mouseenter", function () {
    $(this).addClass("paused");
  });
  $(".partners-carousel").on("mouseleave", function () {
    $(this).removeClass("paused");
  });
});
