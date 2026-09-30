import i18n from "i18next";
import type { GetMessages } from "keycloakify-emails";
import { initReactI18next } from "react-i18next";

import arTranslation from "./locales/ar/translation.json";
import caTranslation from "./locales/ca/translation.json";
import csTranslation from "./locales/cs/translation.json";
import daTranslation from "./locales/da/translation.json";
import deTranslation from "./locales/de/translation.json";
import elTranslation from "./locales/el/translation.json";
import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import faTranslation from "./locales/fa/translation.json";
import fiTranslation from "./locales/fi/translation.json";
import frTranslation from "./locales/fr/translation.json";
import huTranslation from "./locales/hu/translation.json";
import itTranslation from "./locales/it/translation.json";
import jaTranslation from "./locales/ja/translation.json";
import kaTranslation from "./locales/ka/translation.json";
import ltTranslation from "./locales/lt/translation.json";
import lvTranslation from "./locales/lv/translation.json";
import nlTranslation from "./locales/nl/translation.json";
import noTranslation from "./locales/no/translation.json";
import plTranslation from "./locales/pl/translation.json";
import pt_BRTranslation from "./locales/pt-BR/translation.json";
import ptTranslation from "./locales/pt/translation.json";
import ruTranslation from "./locales/ru/translation.json";
import skTranslation from "./locales/sk/translation.json";
import svTranslation from "./locales/sv/translation.json";
import thTranslation from "./locales/th/translation.json";
import trTranslation from "./locales/tr/translation.json";
import ukTranslation from "./locales/uk/translation.json";
import zh_CNTranslation from "./locales/zh-CN/translation.json";
import zh_TWTranslation from "./locales/zh-TW/translation.json";

const resources = {
    ar: {
        translation: arTranslation,
    },
    ca: {
        translation: caTranslation,
    },
    cs: {
        translation: csTranslation,
    },
    da: {
        translation: daTranslation,
    },
    de: {
        translation: deTranslation,
    },
    el: {
        translation: elTranslation,
    },
    en: {
        translation: enTranslation,
    },
    es: {
        translation: esTranslation,
    },
    fa: {
        translation: faTranslation,
    },
    fi: {
        translation: fiTranslation,
    },
    fr: {
        translation: frTranslation,
    },
    hu: {
        translation: huTranslation,
    },
    it: {
        translation: itTranslation,
    },
    ja: {
        translation: jaTranslation,
    },
    ka: {
        translation: kaTranslation,
    },
    lt: {
        translation: ltTranslation,
    },
    lv: {
        translation: lvTranslation,
    },
    nl: {
        translation: nlTranslation,
    },
    no: {
        translation: noTranslation,
    },
    pl: {
        translation: plTranslation,
    },
    pt: {
        translation: ptTranslation,
    },
    "pt-BR": {
        translation: pt_BRTranslation,
    },
    ru: {
        translation: ruTranslation,
    },
    sk: {
        translation: skTranslation,
    },
    sv: {
        translation: svTranslation,
    },
    th: {
        translation: thTranslation,
    },
    tr: {
        translation: trTranslation,
    },
    uk: {
        translation: ukTranslation,
    },
    "zh-CN": {
        translation: zh_CNTranslation,
    },
    "zh-TW": {
        translation: zh_TWTranslation,
    },
};

void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;

/**
 * we want to have this as function with a params, to give developers a
 * flexibility to initialize theirs own i18n solution here
 */
export const getMessages: GetMessages = props => {
    const t = i18n.getFixedT(props.locale);

    return {
        "requiredAction.CONFIGURE_TOTP": t("requiredAction.configure_totp"),
        "requiredAction.TERMS_AND_CONDITIONS": t("requiredAction.terms_and_conditions"),
        "requiredAction.UPDATE_PASSWORD": t("requiredAction.update_password"),
        "requiredAction.UPDATE_PROFILE": t("requiredAction.update_profile"),
        "requiredAction.VERIFY_EMAIL": t("requiredAction.verify_email"),
        "requiredAction.CONFIGURE_RECOVERY_AUTHN_CODES": t("requiredAction.configure_recovery_authn_codes"),
        "linkExpirationFormatter.timePeriodUnit.seconds": t("requiredAction.seconds"),
        "linkExpirationFormatter.timePeriodUnit.minutes": t("requiredAction.minutes"),
        "linkExpirationFormatter.timePeriodUnit.hours": t("requiredAction.hours"),
        "linkExpirationFormatter.timePeriodUnit.days": t("requiredAction.days"),
    };
};
