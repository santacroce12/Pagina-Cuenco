(function () {
  const GA_META_NAME = "ga-measurement-id";
  let analyticsInitialized = false;

  const initAnalytics = () => {
    if (analyticsInitialized) return;

    const metaTag = document.querySelector(`meta[name="${GA_META_NAME}"]`);
    const measurementId = metaTag?.getAttribute("content")?.trim();

    if (!measurementId) return;

    const isValidId = /^G-[A-Z0-9]+$/i.test(measurementId);
    if (!isValidId) {
      console.warn(
        `[analytics] Measurement ID "${measurementId}" no parece un ID GA4 válido (formato esperado G-XXXXXXXX). Se omite la carga.`,
      );
      return;
    }

    analyticsInitialized = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", measurementId, { anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  };

  const loadComponents = () => {
    const rootPath = (document.body.dataset.rootPath || ".").replace(/\/$/, "");
    window.__APP_ROOT_PATH__ = rootPath;

    const placeholders = document.querySelectorAll("[data-component]");
    if (!placeholders.length) {
      document.dispatchEvent(
        new CustomEvent("components:loaded", { detail: { rootPath } }),
      );
      return;
    }

    const requests = Array.from(placeholders).map(async (placeholder) => {
      const name = placeholder.dataset.component;
      if (!name) return;
      const resourcePath = `${rootPath}/partials/${name}.html`.replace(
        /\\/g,
        "/",
      );

      try {
        const response = await fetch(resourcePath);
        if (!response.ok) throw new Error(`Estado ${response.status}`);
        const markup = await response.text();
        const hydrated = markup.replace(/%ROOT%/g, rootPath);
        placeholder.innerHTML = hydrated;
      } catch (error) {
        console.error(`[components] No se pudo cargar ${resourcePath}`, error);
      }
    });

    Promise.allSettled(requests).finally(() => {
      const yearBadge = document.getElementById("currentYear");
      if (yearBadge) {
        yearBadge.textContent = new Date().getFullYear();
      }

      document.dispatchEvent(
        new CustomEvent("components:loaded", { detail: { rootPath } }),
      );
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initAnalytics();
    loadComponents();
  });
})();
