
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { PlatformData, CharacterData, ModelType } from '../../types';

// --- PHYSICS CONSTANTS ---
const GRAVITY = 40; 
const MOVE_SPEED = 8.5; 
const JUMP_FORCE = 24; 
const DOUBLE_JUMP_FORCE = 20;
const DASH_FORCE = 32; 
const DASH_DURATION = 0.2; 
const DASH_COOLDOWN = 0.6; 
const MAX_FALL_SPEED = 40;

interface PlayerProps {
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  setVelocity: (v: number) => void;
  onWin: () => void;
  platforms: PlatformData[];
  goalPosition: THREE.Vector3;
  characterData: CharacterData;
}

// --- VISUALS: PLAYER MODEL COMPONENT ---
export const PlayerModel = ({ velocity, isGrounded, colors, modelType }: { velocity: THREE.Vector3; isGrounded: boolean; colors: CharacterData['colors']; modelType: ModelType }) => {
  const group = useRef<THREE.Group>(null);
  const bodyMesh = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  
  // Specific refs for Proto animations
  const protoRing = useRef<THREE.Mesh>(null);
  const protoCore = useRef<THREE.Mesh>(null);

  // Dynamic Materials based on Character Data
  const materials = useMemo(() => ({
    armor: new THREE.MeshStandardMaterial({ 
        color: colors.primary, 
        roughness: 0.4, 
        metalness: 0.6 
    }),
    joints: new THREE.MeshStandardMaterial({ 
        color: '#0f172a', 
        roughness: 0.8, 
        metalness: 0.5 
    }),
    neon: new THREE.MeshStandardMaterial({ 
        color: colors.secondary, 
        emissive: colors.glow, 
        emissiveIntensity: 4, 
        toneMapped: false 
    }),
    blade: new THREE.MeshPhysicalMaterial({ 
        color: '#ffffff', 
        emissive: colors.secondary, 
        emissiveIntensity: 2, 
        transparent: true, 
        opacity: 0.8, 
        transmission: 0.2, 
        roughness: 0.1 
    }),
    glass: new THREE.MeshPhysicalMaterial({
        color: colors.glow,
        transparent: true,
        opacity: 0.4,
        roughness: 0,
        metalness: 1
    })
  }), [colors]);

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();
    const speed = new THREE.Vector3(velocity.x, 0, velocity.z).length();
    const isMoving = speed > 0.5;

    // 1. ROTATION
    if (isMoving) {
        const angle = Math.atan2(velocity.x, velocity.z);
        const targetRot = angle;
        let currentRot = group.current.rotation.y;
        if (targetRot - currentRot > Math.PI) currentRot += Math.PI * 2;
        if (currentRot - targetRot > Math.PI) currentRot -= Math.PI * 2;
        
        group.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot, 0.2);
    }
    
    // Lean effect for Stealth
    if (modelType === 'STEALTH') {
       group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, isMoving ? 0.3 : 0, 0.1);
    } else {
       group.current.rotation.x = 0;
    }
    group.current.rotation.z = 0;

    // 2. ANIMATIONS
    // Proto specific animations
    if (modelType === 'PROTO') {
        if (protoRing.current) {
            protoRing.current.rotation.x = time * 0.5;
            protoRing.current.rotation.y = time * 0.3;
        }
        if (protoCore.current) {
            protoCore.current.rotation.y = -time;
            protoCore.current.rotation.z = time * 0.5;
        }
    }

    // Limb Animations
    if (!isGrounded) {
       // Jumping Pose
       if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0.5, 0.1);
       if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0.2, 0.1);
       if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -2.0, 0.1); 
       if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -2.0, 0.1);
    } 
    else if (isMoving) {
       // Running Pose
       const runFreq = 15;
       if (leftLeg.current) leftLeg.current.rotation.x = Math.sin(time * runFreq) * 1.0;
       if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(time * runFreq + Math.PI) * 1.0;
       if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * runFreq + Math.PI) * 0.8;
       if (rightArm.current) rightArm.current.rotation.x = Math.sin(time * runFreq) * 0.8;
    } 
    else {
       // Idle Pose (Breathing)
       if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1);
       if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1);
       if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * 2) * 0.05;
       if (rightArm.current) rightArm.current.rotation.x = Math.sin(time * 2 + Math.PI) * 0.05;
    }

    materials.neon.emissiveIntensity = 2 + Math.sin(time * 8) * 1.5;
  });

  // --- MODEL GEOMETRIES ---

  const renderStandard = () => (
    <>
        {/* Head: Boxy with Visor */}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow material={materials.armor}>
           <boxGeometry args={[0.35, 0.35, 0.35]} />
        </mesh>
        <mesh position={[0, 1.45, 0.15]} material={materials.neon}>
           <boxGeometry args={[0.25, 0.1, 0.1]} />
        </mesh>
        {/* Torso: Plate Carrier */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={materials.armor}>
            <boxGeometry args={[0.5, 0.7, 0.35]} />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0.9, -0.25]} castShadow material={materials.joints}>
            <boxGeometry args={[0.4, 0.5, 0.2]} />
        </mesh>
        {/* Core */}
        <mesh position={[0, 0.8, 0.18]} material={materials.neon}>
            <circleGeometry args={[0.08, 16]} />
        </mesh>
    </>
  );

  const renderStealth = () => (
      <>
        {/* Head: Aerodynamic Cone */}
        <mesh position={[0, 1.4, 0.1]} rotation={[-0.2, 0, 0]} castShadow receiveShadow material={materials.armor}>
            <coneGeometry args={[0.2, 0.5, 4]} />
        </mesh>
        <mesh position={[0, 1.45, 0.22]} rotation={[-0.2, 0, 0]} material={materials.neon}>
            <planeGeometry args={[0.1, 0.2]} />
        </mesh>
        
        {/* Torso: Slim & Angular */}
        <mesh position={[0, 0.8, 0]} rotation={[0.1, 0, 0]} castShadow receiveShadow material={materials.armor}>
            <cylinderGeometry args={[0.15, 0.25, 0.6, 4]} />
        </mesh>
        
        {/* Speed Flaps/Wings */}
        <mesh position={[0.2, 1.1, -0.1]} rotation={[0, 0, -0.5]} material={materials.neon}>
            <boxGeometry args={[0.1, 0.4, 0.05]} />
        </mesh>
        <mesh position={[-0.2, 1.1, -0.1]} rotation={[0, 0, 0.5]} material={materials.neon}>
            <boxGeometry args={[0.1, 0.4, 0.05]} />
        </mesh>
      </>
  );

  const renderHeavy = () => (
      <>
        {/* Head: Domed & Low */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow material={materials.armor}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
        </mesh>
        <mesh position={[0, 1.3, 0.21]} material={materials.neon}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
        </mesh>

        {/* Torso: Massive Hexagon */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow material={materials.armor}>
             <cylinderGeometry args={[0.4, 0.35, 0.7, 6]} />
        </mesh>
        
        {/* Huge Shoulder Pads attached to Body */}
        <mesh position={[0.4, 1.0, 0]} rotation={[0, 0, -0.2]} castShadow material={materials.armor}>
             <boxGeometry args={[0.3, 0.4, 0.4]} />
        </mesh>
        <mesh position={[-0.4, 1.0, 0]} rotation={[0, 0, 0.2]} castShadow material={materials.armor}>
             <boxGeometry args={[0.3, 0.4, 0.4]} />
        </mesh>

        {/* Reactor on back */}
        <mesh position={[0, 0.8, -0.25]} material={materials.neon}>
             <cylinderGeometry args={[0.1, 0.1, 0.5]} rotation={[Math.PI/2, 0, 0]} />
        </mesh>
      </>
  );

  const renderProto = () => (
      <>
        {/* Head: Floating Diamond */}
        <mesh ref={protoCore} position={[0, 1.5, 0]} castShadow receiveShadow material={materials.neon}>
            <octahedronGeometry args={[0.25, 0]} />
        </mesh>
        
        {/* Halo Ring */}
        <mesh ref={protoRing} position={[0, 1.5, 0]} rotation={[Math.PI/2, 0, 0]} material={materials.glass}>
            <torusGeometry args={[0.4, 0.01, 8, 32]} />
        </mesh>

        {/* Torso: Disconnected Shards */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow material={materials.armor}>
                <dodecahedronGeometry args={[0.3, 0]} />
            </mesh>
        </Float>
        
        {/* Spine energy */}
        <mesh position={[0, 0.8, 0]} material={materials.neon}>
             <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
      </>
  );

  const modelConfig = useMemo(() => {
    switch(modelType) {
        case 'HEAVY': return { armOffset: 0.55, legOffset: 0.25, limbScale: [1.2, 1, 1.2], bladeScale: [1, 1, 1] };
        case 'STEALTH': return { armOffset: 0.25, legOffset: 0.15, limbScale: [0.7, 1.1, 0.7], bladeScale: [0.8, 1.2, 1] };
        case 'PROTO': return { armOffset: 0.4, legOffset: 0.15, limbScale: [0.8, 0.8, 0.8], bladeScale: [1, 1.5, 1] };
        default: return { armOffset: 0.35, legOffset: 0.15, limbScale: [1, 1, 1], bladeScale: [1, 1, 1] };
    }
  }, [modelType]);

  const LimbMesh = () => {
    switch (modelType) {
        case 'STEALTH':
            return (
                <mesh position={[0, -0.3, 0]} castShadow material={materials.armor}>
                    <coneGeometry args={[0.08, 0.7, 4]} rotation={[Math.PI, 0, 0]}/> 
                </mesh>
            );
        case 'HEAVY':
             return (
                <mesh position={[0, -0.3, 0]} castShadow material={materials.armor}>
                    <cylinderGeometry args={[0.12, 0.15, 0.6, 8]} /> 
                </mesh>
            );
        case 'PROTO':
             return (
                 <group>
                    <mesh position={[0, -0.2, 0]} material={materials.neon}>
                         <octahedronGeometry args={[0.08, 0]} />
                    </mesh>
                     <mesh position={[0, -0.5, 0]} material={materials.armor}>
                         <coneGeometry args={[0.05, 0.3, 4]} rotation={[Math.PI, 0, 0]} />
                    </mesh>
                 </group>
             );
        default: // STANDARD
            return (
                <mesh position={[0, -0.3, 0]} castShadow material={materials.armor}>
                    <boxGeometry args={[0.15, 0.7, 0.15]} />
                </mesh>
            );
    }
  };

  return (
    <group ref={group} dispose={null}>
       <pointLight color={colors.glow} intensity={2} distance={8} decay={2} />
       <Sparkles count={15} scale={2} size={4} speed={0.4} opacity={0.5} color={colors.glow} />

       <group ref={bodyMesh}>
          
          {modelType === 'STANDARD' && renderStandard()}
          {modelType === 'STEALTH' && renderStealth()}
          {modelType === 'HEAVY' && renderHeavy()}
          {modelType === 'PROTO' && renderProto()}

          <group ref={leftArm} position={[-modelConfig.armOffset, 1.0, 0]}>
             <LimbMesh />
             {/* Blade only on left arm */}
             <mesh position={[0, -0.4, 0.2]} rotation={[0.4, 0, 0]} material={materials.blade} scale={new THREE.Vector3(...modelConfig.bladeScale)}>
                <boxGeometry args={[0.05, 0.8, 0.02]} />
             </mesh>
          </group>

          <group ref={rightArm} position={[modelConfig.armOffset, 1.0, 0]}>
             <LimbMesh />
             {/* Heavy characters get arm shield */}
             {modelType === 'HEAVY' && (
                 <mesh position={[0.15, -0.2, 0]} rotation={[0,0,0.1]} material={materials.armor}>
                    <boxGeometry args={[0.1, 0.6, 0.4]} />
                 </mesh>
             )}
          </group>

          <group ref={leftLeg} position={[-modelConfig.legOffset, 0.3, 0]}>
             <LimbMesh />
          </group>
          
          <group ref={rightLeg} position={[modelConfig.legOffset, 0.3, 0]}>
             <LimbMesh />
          </group>
       </group>
    </group>
  );
};

// --- MAIN CONTROLLER COMPONENT ---
export const Player: React.FC<PlayerProps> = ({ setHealth, setVelocity, onWin, platforms, goalPosition, characterData }) => {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const shakeIntensity = useRef(0);
  
  // Physics State
  const [position, setPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const [velocity, setVel] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isGrounded, setIsGrounded] = useState(false);
  const [jumps, setJumps] = useState(0);
  
  // Input State
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // MAIN GAME LOOP
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Time management for dash cooldowns
    const time = state.clock.getElapsedTime();
    const lastDashTime = playerRef.current.userData.lastDashTime || 0;
    const isDashing = (time - lastDashTime) < DASH_DURATION;

    // 1. INPUT HANDLING
    const forward = (keys.current['KeyW'] || keys.current['ArrowUp']) ? 1 : 0;
    const backward = (keys.current['KeyS'] || keys.current['ArrowDown']) ? 1 : 0;
    const left = (keys.current['KeyA'] || keys.current['ArrowLeft']) ? 1 : 0;
    const right = (keys.current['KeyD'] || keys.current['ArrowRight']) ? 1 : 0;
    
    // Calculate input direction
    const inputZ = -(forward - backward);
    const inputX = (right - left);
    const inputDir = new THREE.Vector3(inputX, 0, inputZ).normalize();

    // 2. PHYSICS UPDATE
    let newVel = velocity.clone();

    // Horizontal Movement
    if (isDashing) {
        newVel.x *= 0.96;
        newVel.z *= 0.96;
    } else {
        if (inputDir.length() > 0) {
            newVel.x = inputDir.x * MOVE_SPEED;
            newVel.z = inputDir.z * MOVE_SPEED;
        } else {
            newVel.x = 0;
            newVel.z = 0;
        }
    }

    // Jumping
    if (keys.current['Space']) {
        if (!playerRef.current.userData.jumpPressed) {
             if (isGrounded) {
                 newVel.y = JUMP_FORCE;
                 setJumps(1);
                 setIsGrounded(false);
             } else if (jumps < 2) {
                 newVel.y = DOUBLE_JUMP_FORCE;
                 setJumps(2);
                 newVel.add(inputDir.multiplyScalar(5));
             }
             playerRef.current.userData.jumpPressed = true;
        }
    } else {
        playerRef.current.userData.jumpPressed = false;
    }

    // Phase Dash logic
    const isShiftPressed = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    
    if (isShiftPressed && !playerRef.current.userData.dashPressed) {
         if ((time - lastDashTime) > DASH_COOLDOWN) {
             if (inputDir.length() > 0) {
                const dashVel = inputDir.clone().multiplyScalar(DASH_FORCE);
                newVel.x = dashVel.x;
                newVel.z = dashVel.z;
                newVel.y = 3; 
                
                playerRef.current.userData.lastDashTime = time;
                shakeIntensity.current = 0.4; 
             }
         }
         playerRef.current.userData.dashPressed = true;
    }
    
    if (!isShiftPressed) {
         playerRef.current.userData.dashPressed = false;
    }

    // Vertical Physics
    newVel.y -= GRAVITY * delta;
    if (newVel.y < -MAX_FALL_SPEED) newVel.y = -MAX_FALL_SPEED;

    // Apply Velocity to Position
    const newPos = position.clone();
    newPos.add(newVel.clone().multiplyScalar(delta));

    // 3. COLLISION DETECTION
    let groundedThisFrame = false;
    
    if (newVel.y <= 0) {
        for (const plat of platforms) {
            const pMinX = plat.position[0] - plat.size[0]/2;
            const pMaxX = plat.position[0] + plat.size[0]/2;
            const pMinZ = plat.position[2] - plat.size[2]/2;
            const pMaxZ = plat.position[2] + plat.size[2]/2;
            const pY = plat.position[1] + plat.size[1]/2;

            if (newPos.x > pMinX && newPos.x < pMaxX && newPos.z > pMinZ && newPos.z < pMaxZ) {
                if (position.y >= pY && newPos.y <= pY + 0.2) {
                    const impactForce = Math.abs(newVel.y);
                    if (impactForce > 5) { 
                         shakeIntensity.current += Math.min(impactForce * 0.05, 1.0);
                    }
                    newPos.y = pY;
                    newVel.y = 0;
                    groundedThisFrame = true;
                    setJumps(0);
                    break;
                }
            }
        }
    }

    // Reset loop
    if (newPos.y < -50) {
        setHealth(prev => Math.max(0, prev - 25)); 
        newPos.copy(new THREE.Vector3(0, 5, 0));
        newVel.set(0,0,0);
        shakeIntensity.current = 0.5;
    }

    // Win Condition
    if (newPos.distanceTo(goalPosition) < 3) {
        onWin();
    }

    // Update State
    setPos(newPos);
    setVel(newVel);
    setIsGrounded(groundedThisFrame);
    playerRef.current.position.copy(newPos);
    
    const speedH = Math.sqrt(newVel.x**2 + newVel.z**2);
    setVelocity(Math.round(speedH * 10));

    // 4. CAMERA FOLLOW
    const camOffset = new THREE.Vector3(0, 7, 14); 
    const targetCamPos = newPos.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.1);
    
    shakeIntensity.current = THREE.MathUtils.lerp(shakeIntensity.current, 0, 0.1);

    if (shakeIntensity.current > 0.01) {
        const s = shakeIntensity.current;
        const rx = (Math.random() - 0.5) * s;
        const ry = (Math.random() - 0.5) * s;
        const rz = (Math.random() - 0.5) * s;
        camera.position.add(new THREE.Vector3(rx, ry, rz));
    }

    camera.lookAt(newPos.clone().add(new THREE.Vector3(0, 1.5, 0))); 

  });

  return (
    <group ref={playerRef} position={position}>
       <Trail
          width={0.6}
          length={6}
          color={new THREE.Color(characterData.colors.glow)}
          attenuation={(t) => t * t}
       >
          <PlayerModel velocity={velocity} isGrounded={isGrounded} colors={characterData.colors} modelType={characterData.modelType} />
       </Trail>
    </group>
  );
};
