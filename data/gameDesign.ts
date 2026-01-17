import { MechanicFeature } from '../types';

export const MOVEMENT_DATA: MechanicFeature[] = [
  {
    title: "Wall-Running Physics",
    description: "Momentum-based wall traversal that respects approach angle and velocity.",
    technicalDetails: [
      "Raycast detection: 3 rays (forward, left 45°, right 45°) to detect surfaces.",
      "Gravity modification: Reduce vertical gravity by 80% while wall-running; apply slight downward force over time.",
      "Camera tilt: Lerp camera roll to 15° away from wall normal.",
      "State transition: Auto-detach if speed < threshold or angle > 90°."
    ]
  },
  {
    title: "Grappling Hook",
    description: "Physics-driven swing mechanics using joint constraints.",
    technicalDetails: [
      "Hook Point: Raycast to valid surface -> Create Anchor.",
      "Physics: Add force towards anchor point (Centripetal) + Velocity preservation.",
      "Elasticity: Simulated using a dampened spring joint model.",
      "Release: Convert angular momentum into linear forward velocity boost."
    ]
  },
  {
    title: "Dash & Slide",
    description: "High-speed maneuvers for evasion and momentum maintenance.",
    technicalDetails: [
      "Dash: Instant impulse force vector. Grants i-frames (0.2s). Costs Stamina/Energy.",
      "Slide: Reduces friction coefficient to near zero. Increases FOV. Hitbox height reduced by 50%.",
      "Slide Jump: Jumping during a slide preserves 110% of current velocity."
    ]
  }
];

export const COMBAT_DATA: MechanicFeature[] = [
  {
    title: "Hybrid Weapon System",
    description: "Seamless switching between melee energy blades and ranged smart weapons.",
    technicalDetails: [
      "State Machine: CombatState can interrupt MovementState but inherits velocity.",
      "Input Buffer: 0.4s buffer for combo inputs (Light -> Light -> Heavy).",
      "Hit Stop: Freeze frame (0.05s) on impact to simulate weight.",
      "IK Hand Placement: Procedural recoil and swing arcs based on camera aim."
    ]
  },
  {
    title: "Time Manipulation (Chronos)",
    description: "Local time dilation bubble around the player.",
    technicalDetails: [
      "Global Time Scale: Remains 1.0.",
      "Enemy Time Scale: Multiplied by 0.2 within 15m radius.",
      "Player Time Scale: Remains 1.0 (creates 'super speed' effect).",
      "Audio: Pitch shift down background SFX; emphasize heartbeat."
    ]
  },
  {
    title: "Dynamic Health Interface",
    description: "Diegetic and HUD-based health visualization for player and entities.",
    technicalDetails: [
      "Player HUD: Screen-space shader effect (vignette reddening) + numeric display.",
      "Enemy UI: World-space canvas floating above mesh, occluded by geometry.",
      "Damage Feedback: Health bar 'chip' damage (delayed white bar reduction) via Lerp.",
      "Event System: OnHealthChange event triggers UI update to decouple logic."
    ]
  }
];

export const ARCHITECTURE_NODES = [
  { id: 'input', label: 'Input Manager', type: 'core', x: 50, y: 50 },
  { id: 'player', label: 'Player Controller', type: 'core', x: 250, y: 50 },
  { id: 'state', label: 'State Machine', type: 'subsystem', x: 250, y: 150 },
  { id: 'physics', label: 'Physics Engine', type: 'core', x: 450, y: 50 },
  { id: 'anim', label: 'Anim Graph (IK)', type: 'visual', x: 450, y: 150 },
  { id: 'camera', label: 'Camera Rig', type: 'visual', x: 250, y: -50 },
  { id: 'ui', label: 'UI / HUD', type: 'visual', x: 50, y: 150 },
];