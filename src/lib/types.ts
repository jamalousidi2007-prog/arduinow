export type Locale = "en" | "fr";

export type UserRole = "admin" | "user";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  banned: boolean;
  locale: Locale;
  createdAtMs: number;
  lastSeenAtMs: number;
}

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  rain: number;
  light: number;
  pressure: number;
}

export interface EditableContent {
  heroTitleEn: string;
  heroTitleFr: string;
  heroSubtitleEn: string;
  heroSubtitleFr: string;
  statsHeadlineEn: string;
  statsHeadlineFr: string;
  footerTextEn: string;
  footerTextFr: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAtMs: number;
  createdByUid: string;
}

export type SensorKey = keyof Omit<SensorReading, "timestamp">;

