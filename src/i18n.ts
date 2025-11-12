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
import viselfStorage from "./locales/vi/selfStorage.json";
import vishareWarehouse from "./locales/vi/shareWarehouse.json";
import vistorageSize from "./locales/vi/storageSize.json";
import viprocess from "./locales/vi/process.json";
import vipartner from "./locales/vi/partner.json";
import vibooking from "./locales/vi/booking.json";
import viauth from "./locales/vi/auth.json";
import vidashboard from "./locales/vi/dashboard.json";

// English
import enLanding from "./locales/en/translation.json";
import enCommon from "./locales/en/common.json";
import enAbout from "./locales/en/about.json";
import enServices from "./locales/en/services.json";
import enContact from "./locales/en/contact.json";
import enNotFound from "./locales/en/notFound.json";
import enServicesOverview from "./locales/en/servicesOverview.json";
import enselfStorage from "./locales/en/selfStorage.json";
import enshareWarehouse from "./locales/en/shareWarehouse.json";
import enstorageSize from "./locales/en/storageSize.json";
import enprocess from "./locales/en/process.json";
import enpartner from "./locales/en/partner.json";
import enbooking from "./locales/en/booking.json";
import enauth from "./locales/en/auth.json";
import endashboard from "./locales/en/dashboard.json";


i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viLanding, 
      common: viCommon,
      about: viAbout,
      services: viServices,
      contact: viContact,
      notFound: viNotFound,
      servicesOverview:viServicesOverview,
      selfStorage:viselfStorage,
      shareWarehouse:vishareWarehouse,
      storageSize:vistorageSize,
      process:viprocess,
      partner:vipartner,
      booking:vibooking,
      auth:viauth,
      dashboard:vidashboard
    },
    en: {
      translation: enLanding,
      common: enCommon,
      about: enAbout,
      services: enServices,
      contact: enContact,
      notFound: enNotFound,
      servicesOverview:enServicesOverview,
      selfStorage:enselfStorage,
      shareWarehouse:enshareWarehouse,
      storageSize:enstorageSize,
      process:enprocess,
      partner:enpartner,
      booking:enbooking,
      auth:enauth,
      dashboard:endashboard

    },
  },
  lng: "vi",
  fallbackLng: "vi",
   ns: [
    "translation",
    "common",
    "about",
    "services",
    "contact",
    "notFound",
    "servicesOverview",
    "selfStorage",
    "shareWarehouse",
    "storageSize",    
    "process",
    "partner",
    "booking",
  ],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
});

export default i18n;
