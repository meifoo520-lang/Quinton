
import React from 'react';

export enum SystemSection {
  OVERVIEW = 'OVERVIEW',
  MOVEMENT = 'MOVEMENT',
  COMBAT = 'COMBAT',
  WORLD = 'WORLD',
  ARCHITECTURE = 'ARCHITECTURE',
  DATABASE = 'DATABASE',
  SHOP = 'SHOP'
}

export enum GameMode {
  ARCHITECT = 'ARCHITECT',
  SIMULATION = 'SIMULATION'
}

export interface PlayerStats {
  credits: number;
  highestLevel: number;
  totalDeaths: number;
  gamesPlayed: number;
  lastLogin: string;
  inventory: string[]; // List of Character IDs
  equippedCharacterId: string;
}

export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY';
export type ModelType = 'STANDARD' | 'STEALTH' | 'HEAVY' | 'PROTO';

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  modelType: ModelType;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

export interface GameSystemNode {
  id: string;
  label: string;
  type: 'core' | 'subsystem' | 'visual' | 'data';
  connections: string[];
  description: string;
}

export interface MechanicFeature {
  title: string;
  description: string;
  technicalDetails: string[];
}

// Physics Types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlatformData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isNeon?: boolean;
}

// Augment JSX.IntrinsicElements to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
