
import { SystemSection } from './types';

export const THEME = {
  colors: {
    primary: '#0ea5e9', // Sky blue neon
    secondary: '#d946ef', // Magenta neon
    accent: '#10b981', // Emerald neon
    dark: '#05050a',
    panel: 'rgba(15, 23, 42, 0.6)',
  }
};

export const SYSTEMS_NAV = [
  { id: SystemSection.OVERVIEW, label: 'Game Overview', icon: 'LayoutDashboard' },
  { id: SystemSection.SHOP, label: 'Supply Drop', icon: 'Box' },
  { id: SystemSection.MOVEMENT, label: 'Traversal Systems', icon: 'Move3d' },
  { id: SystemSection.COMBAT, label: 'Combat Logic', icon: 'Sword' },
  { id: SystemSection.WORLD, label: 'World & AI', icon: 'Globe' },
  { id: SystemSection.ARCHITECTURE, label: 'Tech Stack', icon: 'Cpu' },
  { id: SystemSection.DATABASE, label: 'Player Database', icon: 'Database' },
];
