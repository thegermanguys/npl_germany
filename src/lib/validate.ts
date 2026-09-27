import { isCricHeroesUrl, normalizeCricHeroesUrl } from "./cricheroes.ts";
import {
  BATTING_HANDS,
  BOWLING_STYLES,
  CITIES,
  ELIGIBILITY_STATUSES,
  EXPERIENCE_LEVELS,
  PLAYING_ROLES,
  ROLES,
  SEASON_STATUSES,
  type EligibilityStatus,
  type FieldErrors,
  type PlayingRole,
  type Role,
  type SeasonStatus,
} from "./types.ts";

export function isEligibilityStatus(value: string): value is EligibilityStatus {
  return (ELIGIBILITY_STATUSES as readonly string[]).includes(value);
}

export function checkboxOn(value: FormDataEntryValue | string | boolean | null | undefined): boolean {
  if (value === true) return true;
  if (typeof value !== "string") return false;
  const text = value.toLowerCase();
  return text === "yes" || text === "on" || text === "true" || text === "1";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPlayingRole(value: string): value is PlayingRole {
  return (PLAYING_ROLES as readonly string[]).includes(value);
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isSeasonStatus(value: string): value is SeasonStatus {
  return (SEASON_STATUSES as readonly string[]).includes(value);
}

export type RegistrationInput = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  playingRole: string;
  experience: string;
  nepaliCitizen: boolean;
  germanyLegalResident: boolean;
  cricheroesUrl: string;
};

export type RegistrationValue = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  playingRole: PlayingRole;
  experience: string;
  nepaliCitizen: boolean;
  germanyLegalResident: boolean;
  cricheroesUrl: string;
};

export function validateRegistration(
  input: RegistrationInput,
): { ok: true; value: RegistrationValue } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const phone = input.phone.trim();
  const city = input.city.trim();
  const playingRole = input.playingRole.trim();
  const experience = input.experience.trim();
  const cricheroesUrl = normalizeCricHeroesUrl(input.cricheroesUrl) ?? input.cricheroesUrl.trim();

  if (fullName.length < 2) errors.fullName = "Enter your name.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (!phone) errors.phone = "Enter a phone number.";
  if (!(CITIES as readonly string[]).includes(city)) errors.city = "Choose a city.";
  if (!isPlayingRole(playingRole)) errors.playingRole = "Choose a playing role.";
  if (!(EXPERIENCE_LEVELS as readonly string[]).includes(experience)) {
    errors.experience = "Choose your experience.";
  }
  if (!input.nepaliCitizen) errors.nepaliCitizen = "Season 1 is for Nepali nationals.";
  if (!input.germanyLegalResident) {
    errors.germanyLegalResident = "Season 1 needs legal status living in Germany.";
  }
  if (!isCricHeroesUrl(input.cricheroesUrl)) {
    errors.cricheroesUrl = "Enter your CricHeroes profile URL.";
  }

  if (Object.keys(errors).length || !isPlayingRole(playingRole) || !isCricHeroesUrl(input.cricheroesUrl)) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      fullName,
      email,
      password,
      phone,
      city,
      playingRole,
      experience,
      nepaliCitizen: true,
      germanyLegalResident: true,
      cricheroesUrl,
    },
  };
}

export type ProfileUpdateInput = {
  fullName: string;
  phone: string;
  city: string;
  playingRole: string;
  experience: string;
  battingHand: string;
  bowlingStyle: string;
  nepaliCitizen: boolean;
  germanyLegalResident: boolean;
  cricheroesUrl: string;
};

export function validateProfileUpdate(
  input: ProfileUpdateInput,
): { ok: true; value: ProfileUpdateInput & { cricheroesUrl: string } } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const city = input.city.trim();
  const playingRole = input.playingRole.trim();
  const experience = input.experience.trim();
  const battingHand = input.battingHand.trim();
  const bowlingStyle = input.bowlingStyle.trim();
  const cricheroesUrl = normalizeCricHeroesUrl(input.cricheroesUrl) ?? input.cricheroesUrl.trim();

  if (fullName.length < 2) errors.fullName = "Enter a name.";
  if (!phone) errors.phone = "Enter a phone number.";
  if (!(CITIES as readonly string[]).includes(city)) errors.city = "Choose a city.";
  if (!isPlayingRole(playingRole)) errors.playingRole = "Choose a playing role.";
  if (!(EXPERIENCE_LEVELS as readonly string[]).includes(experience)) {
    errors.experience = "Choose experience.";
  }
  if (battingHand && !(BATTING_HANDS as readonly string[]).includes(battingHand)) {
    errors.battingHand = "Choose a batting hand.";
  }
  if (bowlingStyle && !(BOWLING_STYLES as readonly string[]).includes(bowlingStyle)) {
    errors.bowlingStyle = "Choose a bowling style.";
  }
  if (!input.nepaliCitizen) errors.nepaliCitizen = "Season 1 is for Nepali nationals.";
  if (!input.germanyLegalResident) {
    errors.germanyLegalResident = "Season 1 needs legal status living in Germany.";
  }
  if (!isCricHeroesUrl(input.cricheroesUrl)) {
    errors.cricheroesUrl = "Enter a CricHeroes profile URL.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      fullName,
      phone,
      city,
      playingRole,
      experience,
      battingHand,
      bowlingStyle,
      nepaliCitizen: true,
      germanyLegalResident: true,
      cricheroesUrl,
    },
  };
}

export type LoginInput = { email: string; password: string };

export function validateLogin(
  input: LoginInput,
): { ok: true; value: { email: string; password: string } } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (!isValidEmail(email)) errors.email = "Enter a valid email.";
  if (!password) errors.password = "Enter your password.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { email, password } };
}

export function validateNewAccount(input: {
  displayName: string;
  email: string;
  password: string;
  role: string;
  franchiseId: string;
}): { ok: true; value: { displayName: string; email: string; password: string; role: Role; franchiseId: string } } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const displayName = input.displayName.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const role = input.role.trim();
  const franchiseId = input.franchiseId.trim();

  if (displayName.length < 2) errors.displayName = "Enter a name.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (!isRole(role) || role === "admin") errors.role = "Choose player or franchise owner.";
  if (role === "franchise_owner" && !franchiseId) errors.franchiseId = "Assign a franchise.";

  if (Object.keys(errors).length || !isRole(role) || role === "admin") {
    return { ok: false, errors };
  }
  return { ok: true, value: { displayName, email, password, role, franchiseId } };
}
