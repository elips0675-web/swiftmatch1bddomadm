import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ALL_TITLES, TitleMetadata } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Logic to calculate a single best user title based on profile data.
 * Each user gets only ONE title according to the priority hierarchy.
 */
export function getUserTitles(user: any, language: 'RU' | 'EN'): (TitleMetadata & { displayName: string })[] {
  if (!user) return [];

  let bestTitleId = 'rookie';

  // PRIORITY HIERARCHY:
  // 1. King (Match 90+)
  // 2. Party (Interests 5+)
  // 3. Romantic (Bio length > 20)
  // 4. Rookie (Default)

  if (user.match >= 90) {
    bestTitleId = 'king';
  } else if (user.interests && user.interests.length >= 5) {
    bestTitleId = 'party';
  } else if (user.bio && user.bio.length > 20) {
    bestTitleId = 'romantic';
  } else {
    bestTitleId = 'rookie';
  }

  const meta = ALL_TITLES.find(t => t.id === bestTitleId)!;
  return [{ 
    ...meta, 
    displayName: language === 'RU' ? meta.name_ru : meta.name_en 
  }];
}
