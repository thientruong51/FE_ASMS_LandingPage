import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Vietnamese
import viLanding from "./locales/vi/translation.json";
import viCommon from "./locales/vi/common.json";
import viAbout from "./locales/vi/about.json";
import viServices from "./locales/vi/services.json";
import viContact from "./locales/vi/contact.json";
import viNotFound from "./locales/vi/notFound.json";
import viServicesOverview from "./locales/vi/servicesOverview.json";
// English
import enLanding from "./locales/en/translation.json";
import enCommon from "./locales/en/common.json";
import enAbout from "./locales/en/about.json";
import enServices from "./locales/en/services.json";
import enContact from "./locales/en/contact.json";
import enNotFound from "./locales/en/notFound.json";
import enServicesOverview from "./locales/en/servicesOverview.json";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viLanding, 
      common: viCommon,
      about: viAbout,
      services: viServices,
      contact: viContact,
      notFound: viNotFound,
      servicesOverview:viServicesOverview
    },
    en: {
      translation: enLanding,
      common: enCommon,
      about: enAbout,
      services: enServices,
      contact: enContact,
      notFound: enNotFound,
      servicesOverview:enServicesOverview

    },
  },
  lng: "vi",
  fallbackLng: "vi",
  ns: ["translation", "common", "about", "services", "contact", "notFound"],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
});

export default i18n;
