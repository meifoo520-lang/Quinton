
import { CharacterData } from '../types';

export const CHARACTERS: CharacterData[] = [
  {
    id: 'frame_v01',
    name: 'VANGUARD',
    description: 'Standard issue traversing frame. Reliable and balanced.',
    rarity: 'COMMON',
    modelType: 'STANDARD',
    colors: {
      primary: '#1e293b',
      secondary: '#0ea5e9',
      glow: '#0ea5e9'
    }
  },
  {
    id: 'frame_stealth',
    name: 'VOID WALKER',
    description: 'Optimized for minimal radar signature. Aerodynamic chassis.',
    rarity: 'RARE',
    modelType: 'STEALTH',
    colors: {
      primary: '#0f172a',
      secondary: '#a855f7',
      glow: '#d946ef'
    }
  },
  {
    id: 'frame_assault',
    name: 'CRIMSON EDGE',
    description: 'High-output combat chassis. Reinforced plating.',
    rarity: 'RARE',
    modelType: 'HEAVY',
    colors: {
      primary: '#450a0a',
      secondary: '#ef4444',
      glow: '#f87171'
    }
  },
  {
    id: 'frame_proto',
    name: 'SOLARIS PRIME',
    description: 'Experimental prototype using pure energy containment fields.',
    rarity: 'LEGENDARY',
    modelType: 'PROTO',
    colors: {
      primary: '#fffbeb',
      secondary: '#f59e0b',
      glow: '#fbbf24'
    }
  },
  {
    id: 'frame_toxin',
    name: 'ACID RAIN',
    description: 'Industrial hazard plating. Heavy duty filters.',
    rarity: 'COMMON',
    modelType: 'HEAVY',
    colors: {
      primary: '#064e3b',
      secondary: '#10b981',
      glow: '#34d399'
    }
  }
];

export const getCharacterById = (id: string): CharacterData => {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
};
