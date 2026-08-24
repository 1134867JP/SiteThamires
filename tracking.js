/* Origem dos leads e conversões */
(function () {
  "use strict";

  const config = window.TRACKING_CONFIG || {};
  const STORAGE_KEY = "lead_attribution_v1";
  const ATTRIBUTION_TTL = 90 * 24 * 60 * 60 * 1000;
  const CAMPAIGN_FIELDS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term",
    "utm_content", "gclid", "fbclid"
  ];

  function clean(value, maxLength = 200) {
    return String(value || "").trim().slice(0, maxLength);
  }

  function getStoredAttribution() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || Date.now() - stored.updatedAt > ATTRIBUTION_TTL) return null;
      return stored;
    } catch (_) {
      return null;
    }
  }

  function inferSource(campaign) {
    if (campaign.utm_source) return campaign.utm_source;
    if (campaign.gclid) return "google";
    if (campaign.fbclid) return "meta";
    return "";
  }

  function inferMedium(campaign) {
    if (campaign.utm_medium) return campaign.utm_medium;
    if (campaign.gclid || campaign.fbclid) return "paid";
    return "";
  }

  function readCurrentTouch() {
    const params = new URLSearchParams(window.location.search);
    const campaign = {};

    CAMPAIGN_FIELDS.forEach(field => {
      const value = clean(params.get(field));
      if (value) campaign[field] = value;
    });

    campaign.utm_source = inferSource(campaign);
    campaign.utm_medium = inferMedium(campaign);

    return {
      ...campaign,
      landing_page: clean(window.location.href, 500),
      referrer: clean(document.referrer, 500),
      captured_at: new Date().toISOString()
    };
  }

  function hasCampaign(touch) {
    return CAMPAIGN_FIELDS.some(field => Boolean(touch[field]));
  }

  function saveAttribution() {
    const previous = getStoredAttribution();
    const current = readCurrentTouch();
    const attribution = {
      firstTouch: previous?.firstTouch || current,
      lastTouch: hasCampaign(current) ? current : (previous?.lastTouch || current),
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch (_) {
      // Continua funcionando se o armazenamento estiver bloqueado.
    }

    return attribution;
  }

  const attribution = saveAttribution();

  function eventParameters(extra = {}) {
    const touch = attribution.lastTouch || {};
    return {
      lead_source: touch.utm_source || "direct",
      lead_medium: touch.utm_medium || "none",
      lead_campaign: touch.utm_campaign || "not_set",
      lead_content: touch.utm_content || "not_set",
      lead_term: touch.utm_term || "not_set",
      ...extra
    };
  }

  function loadScript(src, id) {
    if (id && document.getElementById(id)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    if (id) script.id = id;
    document.head.appendChild(script);
  }

  function setupGoogle() {
    const ga4Id = /^G-[A-Z0-9]+$/i.test(config.ga4MeasurementId || "")
      ? config.ga4MeasurementId : "";
    const adsId = /^AW-[0-9]+$/i.test(config.googleAdsId || "")
      ? config.googleAdsId : "";
    const primaryId = ga4Id || adsId;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());

    if (!primaryId) return;
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`, "google-tag");
    if (ga4Id) window.gtag("config", ga4Id);
    if (adsId) window.gtag("config", adsId);
  }

  function setupMeta() {
    if (!/^\d{5,20}$/.test(config.metaPixelId || "")) return;

    if (!window.fbq) {
      const fbq = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      window._fbq = fbq;
    }

    loadScript("https://connect.facebook.net/en_US/fbevents.js", "meta-pixel");
    window.fbq("init", config.metaPixelId);
    window.fbq("track", "PageView");
  }

  function googleAdsConversion(label) {
    if (!config.googleAdsId || !label || !window.gtag) return;
    window.gtag("event", "conversion", {
      send_to: `${config.googleAdsId}/${label}`
    });
  }

  function trackWhatsAppClick(ctaLocation = "unknown") {
    const params = eventParameters({
      cta_location: clean(ctaLocation, 80),
      contact_method: "whatsapp"
    });

    window.gtag?.("event", "whatsapp_click", params);
    googleAdsConversion(config.googleAdsWhatsappLabel);
    window.fbq?.("track", "Contact", { content_name: "WhatsApp", ...params });
    window.fbq?.("trackCustom", "WhatsAppClick", params);
  }

  function trackFormSubmission(formName = "lead_form") {
    const params = eventParameters({
      form_name: clean(formName, 80),
      contact_method: "form"
    });

    window.gtag?.("event", "generate_lead", params);
    googleAdsConversion(config.googleAdsFormLabel);
    window.fbq?.("track", "Lead", { content_name: params.form_name, ...params });
  }

  function attributionSummary() {
    const touch = attribution.lastTouch || {};
    const source = touch.utm_source;
    const medium = touch.utm_medium;
    const campaign = touch.utm_campaign;
    if (!source && !campaign) return "";

    const origin = [source, medium].filter(Boolean).join(" / ");
    return [origin && `origem: ${origin}`, campaign && `campanha: ${campaign}`]
      .filter(Boolean)
      .join(" | ");
  }

  function enrichForms() {
    document.querySelectorAll("form").forEach(form => {
      const touch = attribution.lastTouch || {};
      CAMPAIGN_FIELDS.forEach(field => {
        if (!touch[field] || form.elements.namedItem(field)) return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = field;
        input.value = touch[field];
        form.appendChild(input);
      });

      form.addEventListener("submit", () => {
        trackFormSubmission(form.dataset.formName || form.id || "lead_form");
      });
    });
  }

  setupGoogle();
  setupMeta();
  enrichForms();

  window.LeadTracking = {
    getAttribution: () => attribution,
    getAttributionSummary: attributionSummary,
    trackWhatsAppClick,
    trackFormSubmission
  };
})();
