
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, Edges, RoundedBox } from '@react-three/drei';
import { PlatformData } from '../../types';

export interface MarkerData {
  position: number[];
  rotation: number[];
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  platforms: PlatformData[];
  markers?: MarkerData[];
  goalPosition: THREE.Vector3;
}

// LEVEL 1: CALIBRATION
// Simple straight line, huge platforms. Hard to fall.
const LEVEL_1: LevelConfig = {
  id: 0,
  name: "SECTOR 01: CALIBRATION",
  description: "System diagnostics. Basic movement protocols.",
  goalPosition: new THREE.Vector3(0, 0, -60),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [0, -2, -15], size: [10, 1, 15], color: '#334155' },
    { position: [0, -2, -35], size: [10, 1, 15], color: '#334155' },
    { position: [0, -2, -60], size: [15, 1, 15], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 2: GAPS
// Introduction to jumping.
const LEVEL_2: LevelConfig = {
  id: 1,
  name: "SECTOR 02: THE GAP",
  description: "Jump mechanics engaged.",
  goalPosition: new THREE.Vector3(0, 0, -70),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [0, -2, -18], size: [8, 1, 8], color: '#334155' },
    { position: [0, -2, -36], size: [8, 1, 8], color: '#334155' },
    { position: [0, 0, -54], size: [8, 1, 8], color: '#0ea5e9', isNeon: true }, // Slight height increase
    { position: [0, 0, -70], size: [15, 1, 15], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 3: STAIRWAY
// Verticality intro.
const LEVEL_3: LevelConfig = {
  id: 2,
  name: "SECTOR 03: STAIRWAY",
  description: "Vertical traversal required.",
  goalPosition: new THREE.Vector3(0, 20, -60),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [0, 2, -15], size: [8, 1, 8], color: '#334155' },
    { position: [0, 6, -30], size: [8, 1, 8], color: '#334155' },
    { position: [0, 12, -45], size: [8, 1, 8], color: '#d946ef', isNeon: true }, // Double jump height
    { position: [0, 20, -60], size: [12, 1, 12], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 4: ZIGZAG
// Steering control.
const LEVEL_4: LevelConfig = {
  id: 3,
  name: "SECTOR 04: ZIGZAG",
  description: "Lateral movement proficiency.",
  goalPosition: new THREE.Vector3(0, 0, -80),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [-10, 0, -20], size: [8, 1, 8], color: '#334155' },
    { position: [10, 2, -40], size: [8, 1, 8], color: '#334155' },
    { position: [-10, 4, -60], size: [8, 1, 8], color: '#0ea5e9', isNeon: true },
    { position: [0, 0, -80], size: [12, 1, 12], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 5: ARCHIPELAGO (Medium)
// Longer jumps, requires dash or good momentum.
const LEVEL_5: LevelConfig = {
  id: 4,
  name: "SECTOR 05: ARCHIPELAGO",
  description: "Momentum maintenance essential.",
  goalPosition: new THREE.Vector3(0, 0, -100),
  platforms: [
    { position: [0, -2, 0], size: [12, 1, 12], color: '#1e293b' },
    { position: [0, 0, -25], size: [6, 1, 6], color: '#334155' }, // Small target
    { position: [0, 2, -50], size: [6, 1, 6], color: '#d946ef', isNeon: true },
    { position: [0, 4, -75], size: [6, 1, 6], color: '#334155' },
    { position: [0, 0, -100], size: [15, 1, 15], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 6: THE BEAM (Medium)
// Narrow path.
const LEVEL_6: LevelConfig = {
  id: 5,
  name: "SECTOR 06: THE BEAM",
  description: "Precision footing required.",
  goalPosition: new THREE.Vector3(0, 0, -120),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [0, 0, -30], size: [4, 1, 40], color: '#334155' }, // Long narrow bridge
    { position: [0, 2, -60], size: [10, 1, 10], color: '#0ea5e9', isNeon: true }, // Rest stop
    { position: [0, 4, -90], size: [2, 1, 40], color: '#d946ef', isNeon: true }, // Thinner bridge
    { position: [0, 0, -120], size: [15, 1, 15], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 7: ASCENSION (Hard)
// Vertical spiral.
const LEVEL_7: LevelConfig = {
  id: 6,
  name: "SECTOR 07: ASCENSION",
  description: "Vertical spiral structure.",
  goalPosition: new THREE.Vector3(0, 50, 0),
  platforms: [
    { position: [0, -2, 0], size: [15, 1, 15], color: '#1e293b' },
    { position: [10, 5, 0], size: [6, 1, 6], color: '#334155' },
    { position: [0, 12, -10], size: [6, 1, 6], color: '#334155' },
    { position: [-10, 19, 0], size: [6, 1, 6], color: '#0ea5e9', isNeon: true },
    { position: [0, 26, 10], size: [6, 1, 6], color: '#334155' },
    { position: [10, 33, 0], size: [6, 1, 6], color: '#d946ef', isNeon: true },
    { position: [0, 40, -10], size: [6, 1, 6], color: '#334155' },
    { position: [0, 50, 0], size: [10, 1, 10], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 8: FRACTURED (Hard)
// Disconnected platforms at varying heights and angles.
const LEVEL_8: LevelConfig = {
  id: 7,
  name: "SECTOR 08: FRACTURED",
  description: "Disordered geometry.",
  goalPosition: new THREE.Vector3(20, 10, -100),
  platforms: [
    { position: [0, -2, 0], size: [10, 1, 10], color: '#1e293b' },
    { position: [-8, 2, -20], size: [6, 1, 6], color: '#334155' },
    { position: [8, 6, -40], size: [6, 1, 6], color: '#334155' },
    { position: [-12, 4, -60], size: [5, 1, 5], color: '#0ea5e9', isNeon: true },
    { position: [0, 10, -80], size: [4, 1, 4], color: '#d946ef', isNeon: true },
    { position: [20, 10, -100], size: [12, 1, 12], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 9: VOID RUN (Very Hard)
// Max distance jumps.
const LEVEL_9: LevelConfig = {
  id: 8,
  name: "SECTOR 09: VOID RUN",
  description: "Maximum velocity required. Do not hesitate.",
  goalPosition: new THREE.Vector3(0, 0, -180),
  platforms: [
    { position: [0, -2, 0], size: [15, 1, 15], color: '#1e293b' },
    { position: [0, 0, -40], size: [8, 1, 8], color: '#334155' }, // Far jump
    { position: [0, 2, -80], size: [8, 1, 8], color: '#0ea5e9', isNeon: true }, // Far jump
    { position: [0, 4, -130], size: [8, 1, 8], color: '#d946ef', isNeon: true }, // VERY Far jump (needs dash)
    { position: [0, 0, -180], size: [20, 1, 20], color: '#05050a', isNeon: true },
  ]
};

// LEVEL 10: THE CORE (Expert)
// Tiny platforms, high risk, combination of vertical and distance.
const LEVEL_10: LevelConfig = {
  id: 9,
  name: "SECTOR 10: THE CORE",
  description: "Final trial. Zero margin for error.",
  goalPosition: new THREE.Vector3(0, 60, -60),
  platforms: [
    { position: [0, -2, 0], size: [12, 1, 12], color: '#1e293b' },
    { position: [0, 5, -20], size: [4, 1, 4], color: '#334155' }, // Tiny
    { position: [15, 15, -20], size: [4, 1, 4], color: '#0ea5e9', isNeon: true }, // High & Side
    { position: [0, 25, -20], size: [4, 1, 4], color: '#334155' }, // Back to center
    { position: [-15, 35, -40], size: [4, 1, 4], color: '#d946ef', isNeon: true }, // Far left
    { position: [0, 45, -60], size: [4, 1, 4], color: '#334155' }, // Forward
    { position: [0, 60, -60], size: [10, 1, 10], color: '#05050a', isNeon: true },
  ]
};

export const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10];

const GuideArrow: React.FC<{ position: number[], rotation: number[] }> = ({ position, rotation }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <group ref={ref} position={new THREE.Vector3(...position)} rotation={new THREE.Euler(...rotation)}>
       <mesh>
         <coneGeometry args={[0.5, 1.5, 4]} />
         <meshStandardMaterial 
            color="#22c55e" 
            emissive="#22c55e" 
            emissiveIntensity={4} 
            toneMapped={false} 
        />
       </mesh>
    </group>
  );
};

const Platform: React.FC<PlatformData & { index: number }> = ({ position, size, color, isNeon, index }) => {
    // Randomize floating parameters slightly for organic feel
    const floatSpeed = useMemo(() => 1 + Math.random() * 0.5, []);
    const floatIntensity = useMemo(() => 0.2 + Math.random() * 0.1, []);

    return (
        <Float speed={floatSpeed} rotationIntensity={0} floatIntensity={floatIntensity} floatingRange={[-0.2, 0.2]}>
            <RoundedBox 
                args={[size[0], size[1], size[2]]} 
                radius={0.15} 
                smoothness={4} 
                position={new THREE.Vector3(...position)}
                receiveShadow
                castShadow
            >
                <meshStandardMaterial 
                    color={color}
                    emissive={isNeon ? color : '#000000'}
                    emissiveIntensity={isNeon ? 2 : 0}
                    roughness={0.7}
                    metalness={0.4}
                />
                
                {/* Visual Aid: Edges to make dark platforms visible against dark background */}
                <Edges 
                    threshold={15} 
                    color={isNeon ? "#ffffff" : "#94a3b8"} 
                    scale={1.02} 
                    opacity={0.4}
                    transparent
                />

                {/* Tech Detail: Top Grid */}
                {!isNeon && (
                     <mesh position={[0, size[1]/2 + 0.005, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[size[0] * 0.9, size[2] * 0.9]} />
                        <meshBasicMaterial 
                            color="#38bdf8" 
                            transparent 
                            opacity={0.15} // Increased visibility
                            wireframe
                        />
                    </mesh>
                )}
            </RoundedBox>
        </Float>
    );
};

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 8) % 20;
    }
  });
  return (
    <group ref={gridRef}>
      <gridHelper args={[400, 40, 0x1e293b, 0x05050a]} position={[0, -50, 0]} />
      <gridHelper args={[400, 40, 0x1e293b, 0x05050a]} position={[0, -50, -400]} />
    </group>
  );
};

const GoalArtifact: React.FC<{ position: THREE.Vector3 }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position.y + 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={[position.x, position.y, position.z]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        {/* Core Crystal */}
        <mesh castShadow>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial 
                color="#fbbf24" 
                emissive="#fbbf24" 
                emissiveIntensity={3} 
                metalness={0.9}
                roughness={0.1}
                toneMapped={false}
            />
        </mesh>
      </Float>
      
      {/* Outer Rings */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[2.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI/2]}>
          <torusGeometry args={[2, 0.05, 16, 100]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>

      <pointLight distance={30} intensity={3} color="#fbbf24" />
      
      {/* SKY BEAM */}
      <mesh position={[0, 100, 0]}>
         <cylinderGeometry args={[0.2, 4, 200, 16, 1, true]} />
         <meshBasicMaterial color="#fbbf24" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export const Level: React.FC<{ config: LevelConfig }> = ({ config }) => {
  return (
    <group>
      {/* Ambient Effects */}
      <Sparkles count={400} scale={[60, 60, 60]} size={4} speed={0.4} opacity={0.4} color="#0ea5e9" position={[0, 10, -50]} />
      <Sparkles count={200} scale={[40, 100, 40]} size={8} speed={1} opacity={0.3} color="#fbbf24" position={[config.goalPosition.x, config.goalPosition.y + 20, config.goalPosition.z]} />
      <MovingGrid />

      {config.platforms.map((plat, i) => (
        <Platform key={i} index={i} {...plat} />
      ))}

      {config.markers?.map((marker, i) => (
        <GuideArrow key={i} position={marker.position} rotation={marker.rotation} />
      ))}

      <GoalArtifact position={config.goalPosition} />
    </group>
  );
};
