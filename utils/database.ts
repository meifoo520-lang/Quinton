
import { PlayerStats } from '../types';
import { CHARACTERS } from '../data/characters';

const DB_KEY = 'NEON_FRACTURE_DB_V2'; // Bumped version

const DEFAULT_STATS: PlayerStats = {
  credits: 500, // Give some starting credits for testing shop
  highestLevel: 0,
  totalDeaths: 0,
  gamesPlayed: 0,
  lastLogin: new Date().toISOString(),
  inventory: [CHARACTERS[0].id],
  equippedCharacterId: CHARACTERS[0].id
};

export const getDatabase = (): PlayerStats => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return DEFAULT_STATS;
    
    const parsed = JSON.parse(raw);
    
    // Migration: ensure inventory exists if loading from older structure
    if (!parsed.inventory) {
      return {
        ...parsed,
        inventory: DEFAULT_STATS.inventory,
        equippedCharacterId: DEFAULT_STATS.equippedCharacterId
      };
    }
    
    return parsed;
  } catch (e) {
    console.warn("Database corrupted, resetting.");
    return DEFAULT_STATS;
  }
};

export const saveDatabase = (stats: Partial<PlayerStats>): PlayerStats => {
  const current = getDatabase();
  const updated = { ...current, ...stats, lastLogin: new Date().toISOString() };
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
  return updated;
};

export const resetDatabase = (): PlayerStats => {
  localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_STATS));
  return DEFAULT_STATS;
};
