import { en } from "./en";
import { ru } from "./ru";
import type { AppText, Language } from "./types";

export type { AppText, Language } from "./types";

export const dictionaries: Record<Language, AppText> = {
  en,
  ru,
};
