(function () {
  const cases = Array.isArray(window.resourcesData) ? window.resourcesData : [];
  const grid = document.getElementById("resourcesGrid");
  const modalContainer = document.getElementById("resourcesModals");
  const CASE_HASH_PREFIX = "#case-";
  const CASE_HASH_PREFIX_LENGTH = CASE_HASH_PREFIX.length;
  const RESOURCES_HASH = "#resources";

  if (!grid || !modalContainer) {
    console.warn("[resources] No se encontraron contenedores para renderizar los casos.");
    return;
  }

  if (!cases.length) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          Estamos preparando nuevos casos de éxito. Vuelve a visitarnos pronto.
        </div>
      </div>
    `;
    return;
  }

  const buildCaseHash = (caseId) => `${CASE_HASH_PREFIX}${encodeURIComponent(caseId)}`;

  const updateHashSilently = (hashFragment = "") => {
    if (typeof window?.history?.replaceState === "function") {
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", `${base}${hashFragment}`);
    } else if (hashFragment) {
      window.location.hash = hashFragment.startsWith("#") ? hashFragment.slice(1) : hashFragment;
    } else {
      window.location.hash = "";
    }
  };

  const getCaseIdFromHash = () => {
    const { hash } = window.location;
    if (!hash) return null;
    try {
      const decoded = decodeURIComponent(hash);
      if (!decoded.toLowerCase().startsWith(CASE_HASH_PREFIX)) return null;
      return decoded.slice(CASE_HASH_PREFIX_LENGTH);
    } catch (error) {
      console.warn("[resources] Hash inválido para caso:", error);
      return null;
    }
  };

  const showCaseModal = (caseId) => {
    const modal = document.getElementById(`case-modal-${caseId}`);
    if (!modal || !window.bootstrap?.Modal) return false;
    window.bootstrap.Modal.getOrCreateInstance(modal).show();
    return true;
  };

  const scrollCardIntoView = (caseId) => {
    const target = grid.querySelector(`[data-case="${caseId}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus?.();
  };

  const sanitizeText = (value) => (typeof value === "string" ? value : "");
  const ensureArray = (value) => (Array.isArray(value) ? value : []);

  const buildTags = (tags = []) =>
    ensureArray(tags)
      .map((tag) => `<span>${sanitizeText(tag)}</span>`)
      .join("");

  const buildHighlights = (items = []) =>
    ensureArray(items)
      .map(
        (item) => `
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>${sanitizeText(item)}</span>
          </li>
        `,
      )
      .join("");

  const buildMetrics = (metrics = []) =>
    ensureArray(metrics)
      .map(
        (metric) => `
          <div class="resource-metric" role="group" aria-label="${sanitizeText(metric.label)}">
            <span class="metric-value">${sanitizeText(metric.value)}</span>
            <span class="metric-label">${sanitizeText(metric.label)}</span>
          </div>
        `,
      )
      .join("");

  const buildLinks = (links = []) => {
    const entries = ensureArray(links);
    if (!entries.length) return "";
    return `
      <div class="case-links">
        ${entries
          .map((link) => {
            const href = typeof link?.href === "string" && link.href.trim() ? link.href : "#";
            const label = sanitizeText(link?.label) || "Ver más";
            const attrs = link?.external === false ? "" : " target=\"_blank\" rel=\"noopener noreferrer\"";
            return `<a class="case-link" href="${href}"${attrs}>${label}</a>`;
          })
          .join("")}
      </div>
    `;
  };

  const getGalleryItems = (data) => {
    if (Array.isArray(data?.images) && data.images.length) {
      return data.images.filter((src) => typeof src === "string" && src.trim().length);
    }
    if (typeof data?.image === "string" && data.image.trim().length) {
      return [data.image];
    }
    return [];
  };

  const getCoverImage = (data) => {
    const gallery = getGalleryItems(data);
    return gallery.length ? gallery[0] : "";
  };

  const buildDescription = (data) => {
    const raw = sanitizeText(data.description);
    if (!raw) return "";

    const paragraphs = raw
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length);

    const sectionConfigs = [
      {
        id: "objective",
        label: "Objetivo",
        icon: "fa-bullseye",
        match: /^(?:el\s+)?objetivo/i,
        strip: /^(?:el\s+)?objetivo(?:\s*fue)?[:\-]?\s*/i,
      },
      {
        id: "challenge",
        label: "Desafío",
        icon: "fa-mountain",
        match: /^(?:el\s+)?desaf/i,
        strip: /^(?:el\s+)?desaf[ií]o[:\-]?\s*/i,
      },
      {
        id: "solution",
        label: "Solución",
        icon: "fa-lightbulb",
        match: /^(?:la\s+)?soluc/i,
        strip: /^(?:la\s+)?soluc[ií]on[:\-]?\s*/i,
      },
      {
        id: "results",
        label: "Resultados",
        icon: "fa-chart-line",
        match: /^(?:los\s+)?resultados/i,
        strip: /^(?:los\s+)?resultados[:\-]?\s*/i,
      },
      {
        id: "partners",
        label: "Colaboradores",
        icon: "fa-handshake-angle",
        match: /^(?:colaboradores?|equipo)/i,
        strip: /^(?:colaboradores?|equipo)[:\-]?\s*/i,
      },
      {
        id: "cta",
        label: "Próximo paso",
        icon: "fa-comments",
        match: /^(¿?\s*(quer[eé]s|pr[oó]ximo paso))/i,
        strip: /^(¿?\s*(quer[eé]s|pr[oó]ximo paso))[:\-\s]*/i,
      },
    ];

    const formatTextBlock = (value, { ensurePeriod = true } = {}) => {
      const trimmed = typeof value === "string" ? value.trim() : "";
      if (!trimmed.length) return "";

      const firstChar = trimmed.charAt(0);
      const capitalized = firstChar
        ? firstChar.toLocaleUpperCase("es-AR") + trimmed.slice(1)
        : trimmed;

      if (!ensurePeriod) return capitalized;

      return /[.!?…]$/.test(capitalized) ? capitalized : `${capitalized}.`;
    };

    return paragraphs
      .map((paragraph, index) => {
        const config = sectionConfigs.find(({ match }) => match.test(paragraph));

        if (config) {
          const content = formatTextBlock(paragraph.replace(config.strip, ""));
          return `
            <div class="resource-section resource-section--${config.id}">
              <div class="resource-section-icon" aria-hidden="true">
                <i class="fas ${config.icon}"></i>
              </div>
              <div class="resource-section-content">
                <h3 class="resource-section-title">${config.label}</h3>
                <p>${content}</p>
              </div>
            </div>
          `;
        }

        if (index === 0) {
          const intro = formatTextBlock(paragraph);
          return `
            <div class="resource-section resource-section--intro">
              <p>${intro}</p>
            </div>
          `;
        }

        return `<p class="resource-paragraph">${formatTextBlock(paragraph)}</p>`;
      })
      .join("\n");
  };

  const buildGallery = (data) => {
    const gallery = getGalleryItems(data);
    if (!gallery.length) return "";

    const title = sanitizeText(data?.title) || "Caso de éxito";

    if (gallery.length === 1) {
      return `
        <div class="resource-gallery-single">
          <img src="${sanitizeText(gallery[0])}" alt="${title}" loading="lazy" />
        </div>
      `;
    }

    const getItemClass = (index, total) => {
      const classes = ["resource-gallery-item"];

      if (index === 0) {
        classes.push("resource-gallery-item--featured");
        return classes.join(" ");
      }

      if (total === 2 && index === 1) {
        classes.push("resource-gallery-item--wide");
        return classes.join(" ");
      }

      if (total >= 3) {
        if (index === 1) {
          classes.push("resource-gallery-item--secondary-left");
          return classes.join(" ");
        }

        if (index === 2) {
          if (total === 3) {
            classes.push("resource-gallery-item--wide");
            return classes.join(" ");
          }
          classes.push("resource-gallery-item--secondary-right");
          return classes.join(" ");
        }

        if (index >= 3) {
          classes.push("resource-gallery-item--stacked");
          return classes.join(" ");
        }
      }

      classes.push("resource-gallery-item--wide");
      return classes.join(" ");
    };

    return `
      <div class="resource-gallery-grid resource-gallery-grid--mosaic" role="group" aria-label="Galería de imágenes del proyecto">
        ${gallery
          .map(
            (src, index) => `
              <div class="${getItemClass(index, gallery.length)}">
                <img src="${sanitizeText(src)}" alt="${title} - imagen ${index + 1}" loading="lazy" />
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  };

  const createCard = (data) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-xl-4";

    const coverImage = getCoverImage(data);
    const cardTitle = sanitizeText(data.title) || "Caso de éxito";

    const coverMarkup = coverImage
      ? `
        <picture>
          <img src="${sanitizeText(coverImage)}" alt="${cardTitle}" loading="lazy" />
        </picture>
      `
      : "";

    col.innerHTML = `
      <article class="caso-card h-100" id="case-${data.id}" data-case="${data.id}" tabindex="0" role="button">
        ${coverMarkup}
        <div class="card-body">
          <div class="caso-meta" aria-label="Etiquetas del caso">
            ${buildTags(data.tags)}
          </div>
          <h3 class="h5">${cardTitle}</h3>
          <p class="mb-0">${sanitizeText(data.summary)}</p>
          <ul class="caso-highlights" aria-label="Resultados clave">
            ${buildHighlights(data.highlights)}
          </ul>
          <div class="caso-footer">
            <button
              type="button"
              class="btn btn-primary w-100"
              data-bs-toggle="modal"
              data-bs-target="#case-modal-${data.id}"
              data-case-trigger="${data.id}"
            >
              Ver caso completo
            </button>
          </div>
        </div>
      </article>
    `;

    return col;
  };

  const createModal = (data) => {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = `case-modal-${data.id}`;
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", `case-modal-title-${data.id}`);
    modal.setAttribute("aria-hidden", "true");
    modal.dataset.caseModal = "true";

    const descriptionMarkup = buildDescription(data);
    const metricsMarkup = buildMetrics(data.metrics);
    const linksMarkup = buildLinks(data.links);
    const ctaLabel = sanitizeText(data?.cta?.label) || "Solicitar información";
    const ctaHref = sanitizeText(data?.cta?.href) || "mailto:contacto@cuencotech.com";
    const galleryMarkup = buildGallery(data);
    const industryLabel = sanitizeText(data.industry) || "Caso de éxito";
    const modalTitle = sanitizeText(data.title) || "Detalle del caso";
    const modalTags = buildTags(data.tags);

    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <span class="badge bg-light text-dark fw-semibold mb-2">${industryLabel}</span>
              <h2 class="h3 mb-0" id="case-modal-title-${data.id}">${modalTitle}</h2>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row gy-4">
              <div class="col-lg-6">
                ${galleryMarkup}
              </div>
              <div class="col-lg-6">
                <div class="resource-modal-content">
                  ${
                    modalTags
                      ? `<div class="resource-modal-tags" aria-label="Etiquetas del caso">${modalTags}</div>`
                      : ""
                  }
                  ${descriptionMarkup}
                  <ul class="caso-highlights" aria-label="Aspectos destacados del proyecto">
                    ${buildHighlights(data.highlights)}
                  </ul>
                  ${metricsMarkup ? `<div class="resource-metrics" aria-label="Indicadores de impacto">${metricsMarkup}</div>` : ""}
                  <div class="d-flex flex-wrap gap-3 mt-4">
                    <a class="btn btn-primary" href="${ctaHref}" target="_blank" rel="noopener noreferrer">
                      ${ctaLabel}
                    </a>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      data-case-share="${data.id}"
                    >
                      <i class="fas fa-link me-2" aria-hidden="true"></i>
                      Copiar enlace
                    </button>
                    ${linksMarkup}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return modal;
  };

  cases.forEach((item) => {
    if (!item?.id) return;
    grid.appendChild(createCard(item));
    modalContainer.appendChild(createModal(item));
  });

  const deepLinkId = getCaseIdFromHash();
  if (deepLinkId) {
    setTimeout(() => {
      if (showCaseModal(deepLinkId)) {
        scrollCardIntoView(deepLinkId);
      }
    }, 150);
  }

  let lastTrigger = null;

  grid.addEventListener("click", (event) => {
    const explicitTrigger = event.target.closest("[data-case-trigger]");
    if (explicitTrigger) {
      lastTrigger = explicitTrigger;
      return;
    }

    const card = event.target.closest("[data-case]");
    if (!card) return;

    const triggerButton = card.querySelector("[data-case-trigger]");
    if (triggerButton) {
      lastTrigger = triggerButton;
      triggerButton.click();
    }
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-case]");
    if (!card) return;
    event.preventDefault();
    const triggerButton = card.querySelector("[data-case-trigger]");
    if (triggerButton) {
      lastTrigger = triggerButton;
      triggerButton.click();
    }
  });

  document.addEventListener("show.bs.modal", (event) => {
    if (event.target.dataset.caseModal === "true") {
      const caseId = event.target.id.replace("case-modal-", "");
      if (caseId) {
        updateHashSilently(buildCaseHash(caseId));
      }
    }
  });

  document.addEventListener("hidden.bs.modal", (event) => {
    if (event.target.dataset.caseModal === "true") {
      updateHashSilently(RESOURCES_HASH);
      if (lastTrigger) {
        lastTrigger.focus();
      }
    }
  });

  modalContainer.addEventListener("click", async (event) => {
    const shareButton = event.target.closest("[data-case-share]");
    if (!shareButton) return;
    const caseId = shareButton.dataset.caseShare;
    if (!caseId) return;

    const shareHash = buildCaseHash(caseId);
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${shareHash}`;
    const originalLabel = shareButton.dataset.originalLabel || shareButton.textContent.trim();
    const originalClasses = shareButton.dataset.originalClasses || shareButton.className;
    shareButton.dataset.originalLabel = originalLabel;
    shareButton.dataset.originalClasses = originalClasses;

    updateHashSilently(shareHash);

    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }

    if (!copied) {
      const fallback = document.createElement("textarea");
      fallback.value = shareUrl;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "absolute";
      fallback.style.left = "-9999px";
      document.body.appendChild(fallback);
      fallback.select();
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(fallback);
    }

    if (copied) {
      shareButton.classList.remove("btn-outline-secondary");
      shareButton.classList.add("btn-success");
      shareButton.textContent = "Enlace copiado";
    } else {
      shareButton.textContent = "Copiá este enlace desde la barra";
    }

    shareButton.disabled = true;

    setTimeout(() => {
      shareButton.disabled = false;
      shareButton.className = shareButton.dataset.originalClasses;
      shareButton.textContent = shareButton.dataset.originalLabel;
    }, 2000);
  });
})();
