  /* ================= JS PRINCIPAL ================= */
(function ($) {
  const rootPath = (
    window.__APP_ROOT_PATH__ ||
    document.body.dataset.rootPath ||
    "."
  ).replace(/\/$/, "");

  /* ================= NAVBAR ================= */
  const updateNavbarState = () => {
    $(".navbar").toggleClass("navbar-scrolled", $(window).scrollTop() > 50);
  };

  $(window).on("scroll", updateNavbarState);
  document.addEventListener("components:loaded", updateNavbarState, {
    once: true,
  });

  /* ================= SMOOTH SCROLL ================= */
  $(document).on("click", 'a[href^="#"]', function (event) {
    const targetSelector = $(this).attr("href");
    if (
      !targetSelector ||
      targetSelector === "#" ||
      $(this).hasClass("no-scroll")
    )
      return;

    const targetElement = $(targetSelector);
    if (!targetElement.length) return;

    event.preventDefault();
    $("html, body").animate(
      { scrollTop: targetElement.offset().top - 70 },
      500,
      "linear",
    );
  });

  /* ================= ANIMACIONES ON SCROLL ================= */
  const initScrollAnimations = () => {
    const animatedSelectors =
      ".about-card, .success-insight-card, .project-main-figure, .project-video-intro, .project-carousel, .market-item, .partner-item";

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
        .querySelectorAll(animatedSelectors)
        .forEach((element) => observer.observe(element));
      return;
    }

    const fallbackAnimation = () => {
      $(animatedSelectors).each(function () {
        const position = $(this).offset().top;
        const scroll = $(window).scrollTop();
        const windowHeight = $(window).height();

        if (
          scroll + windowHeight - 100 > position &&
          !$(this).hasClass("animate")
        ) {
          $(this).addClass("animate");
        }
      });
    };

    $(window).on("scroll", fallbackAnimation);
    fallbackAnimation();
  };

  initScrollAnimations();

document.addEventListener('DOMContentLoaded', function() {
    // 1. Selecciona todas las tarjetas que marcamos como clickeables
    const clickableCards = document.querySelectorAll('.js-clickable-card');

    clickableCards.forEach(card => {
        // 2. Agrega un estilo visual para indicar que es clickeable
        card.style.cursor = 'pointer';

        // 3. Agrega el evento de click a toda la tarjeta
        card.addEventListener('click', function(event) {
            
            // 4. Verifica si el elemento clickeado (o su padre) ya es un enlace <a>.
            // Si el elemento clickeado tiene un ancestro <a> (es decir, ya es parte de un link), 
            // el navegador maneja el click por sí mismo.
            let targetElement = event.target;
            while (targetElement != null && targetElement !== this) {
                if (targetElement.tagName === 'A') {
                    // Si el click fue en un enlace (encabezado o botón), no hacemos nada y salimos.
                    return; 
                }
                targetElement = targetElement.parentElement;
            }

            // 5. Si el click NO fue en un enlace, buscamos la URL de WhatsApp.
            // En tu caso, el primer enlace en el contact-header es el que usaremos.
            const wppLinkElement = this.querySelector('.contact-header-link');
            
            if (wppLinkElement && wppLinkElement.href) {
                // Abrimos la URL de WhatsApp en una nueva pestaña (por el target="_blank")
                window.open(wppLinkElement.href, '_blank');
            }
        });
    });
});

  /* ================= CONTACT WHATSAPP LINKS ================= */
  const initContactWhatsappLinks = (() => {
    let initialized = false;
    return () => {
      if (initialized) return;
      initialized = true;

      document
        .querySelectorAll(".contact-card[data-whatsapp-phone]")
        .forEach((card) => {
          const rawPhone = card.dataset.whatsappPhone || "";
          const cleanedPhone = rawPhone.replace(/\D+/g, "");
          if (cleanedPhone !== rawPhone) {
            card.dataset.whatsappPhone = cleanedPhone;
          }
          if (!cleanedPhone) return;

          const whatsappUrl = `https://wa.me/${cleanedPhone}`;
          const headerLink = card.querySelector(".contact-header-link");
          const whatsappButton = card.querySelector(".btn-whatsapp");

          const openChat = (event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            const target = headerLink?.getAttribute("target") || "_blank";
            const newWindow = window.open(whatsappUrl, target);

            if (!newWindow || newWindow.closed) {
              window.location.href = whatsappUrl;
              return;
            }

            newWindow.opener = null;
          };

          [headerLink, whatsappButton].forEach((link) => {
            if (!link) return;
            link.href = whatsappUrl;
            link.rel = "noopener noreferrer";
            if (!link.target) link.target = "_blank";
          });

          card.addEventListener("click", openChat);

          if (!card.hasAttribute("role")) card.setAttribute("role", "link");
          if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");

          card.addEventListener("keydown", (event) => {
            const isActivationKey = event.key === "Enter" || event.key === " ";
            if (!isActivationKey) return;
            openChat(event);
          });
        });
    };
  })();

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initContactWhatsappLinks();
  } else {
    document.addEventListener("DOMContentLoaded", initContactWhatsappLinks, {
      once: true,
    });
  }

  document.addEventListener("components:loaded", initContactWhatsappLinks);

  /* ================= CAROUSEL VIDEO CONTROL ================= */
  const initProjectCarouselMedia = (() => {
    let initialized = false;
    return () => {
      if (initialized) return;
      const carouselEl = document.getElementById("prototipoCarousel");
      if (!carouselEl) return;
      initialized = true;

      if (window.bootstrap?.Carousel) {
        window.bootstrap.Carousel.getOrCreateInstance(carouselEl);
      }

      const videos = Array.from(carouselEl.querySelectorAll("video"));
      if (!videos.length) return;

      const resetVideos = () => {
        videos.forEach((video) => {
          video.pause();
          try {
            video.currentTime = 0;
          } catch (error) {
            /* ignore */
          }
        });
      };

      const playActiveVideo = () => {
        const activeVideo = carouselEl.querySelector(".carousel-item.active video");
        if (!activeVideo) return;
        const playPromise = activeVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      };

      resetVideos();
      playActiveVideo();

      carouselEl.addEventListener("slide.bs.carousel", () => {
        resetVideos();
      });

      carouselEl.addEventListener("slid.bs.carousel", () => {
        playActiveVideo();
      });
    };
  })();

  document.addEventListener("DOMContentLoaded", initProjectCarouselMedia);
  document.addEventListener("components:loaded", initProjectCarouselMedia);

  /* ================= PAUSAR CARRUSEL EN HOVER ================= */
  $(document).on("mouseenter", ".partners-carousel", function () {
    $(this).addClass("paused");
  });

  $(document).on("mouseleave", ".partners-carousel", function () {
    $(this).removeClass("paused");
  });
})(jQuery);
