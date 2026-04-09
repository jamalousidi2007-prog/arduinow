import type { EditableContent, Locale } from "./types";

export const defaultEditableContent: EditableContent = {
  heroTitleEn: "Greenhouse Intelligence in Real Time",
  heroTitleFr: "Intelligence de serre en temps reel",
  heroSubtitleEn:
    "A premium monitoring space for your Arduino weather station and smart irrigation decisions.",
  heroSubtitleFr:
    "Un espace de surveillance premium pour votre station meteo Arduino et vos decisions d'irrigation.",
  statsHeadlineEn: "Climate signal trends over your current session",
  statsHeadlineFr: "Tendances climatiques pendant votre session",
  footerTextEn: "Precision farming, one live stream at a time.",
  footerTextFr: "Agriculture de precision, flux par flux.",
};

export const localizedContent = (
  content: EditableContent,
  locale: Locale,
): {
  heroTitle: string;
  heroSubtitle: string;
  statsHeadline: string;
  footerText: string;
} => {
  const isFrench = locale === "fr";

  return {
    heroTitle: isFrench ? content.heroTitleFr : content.heroTitleEn,
    heroSubtitle: isFrench ? content.heroSubtitleFr : content.heroSubtitleEn,
    statsHeadline: isFrench ? content.statsHeadlineFr : content.statsHeadlineEn,
    footerText: isFrench ? content.footerTextFr : content.footerTextEn,
  };
};

