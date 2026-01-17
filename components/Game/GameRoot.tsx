
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Loader } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Level, LEVELS } from './Level';
import { Player } from './Player';
import { RotateCcw, Crosshair, Flag, Award, ChevronRight, Volume2, VolumeX, Coins, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDatabase, saveDatabase } from '../../utils/database';
import { getCharacterById } from '../../data/characters';
import { CharacterData } from '../../types';

const MotionDiv = motion.div as any;

// Custom Space Gradient Background
const SpaceBackground = () => {
  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          colorTop: { value: new THREE.Color('#000000') },
          colorBottom: { value: new THREE.Color('#0f172a') }, // Deep Navy
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorTop;
          uniform vec3 colorBottom;
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(mix(colorBottom, colorTop, vUv.y), 1.0);
          }
        `}
      />
    </mesh>
  );
};

interface GameRootProps {
  onExit: () => void;
  isGlobalMuted: boolean;
  toggleGlobalMute: () => void;
}

export const GameRoot: React.FC<GameRootProps> = ({ onExit, isGlobalMuted, toggleGlobalMute }) => {
  // Gameplay State - Initialize from Database Progress
  const [levelIndex, setLevelIndex] = useState(() => {
    const db = getDatabase();
    // Start at the highest unlocked level, or 0 if game completed/reset
    return (db.highestLevel < LEVELS.length) ? db.highestLevel : 0;
  });

  const [health, setHealth] = useState(100);
  const [speed, setSpeed] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isDead, setIsDead] = useState(false);
  
  // Economy & Character State
  const [credits, setCredits] = useState(0);
  const [lastEarnedCredits, setLastEarnedCredits] = useState(0);
  const [character, setCharacter] = useState<CharacterData>(getCharacterById('frame_v01'));
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game Key tracks resets (level change or restart)
  const [gameKey, setGameKey] = useState(0);

  const currentLevel = LEVELS[levelIndex];

  // Logic: Initialize Database on Load
  useEffect(() => {
    const db = getDatabase();
    setCredits(db.credits);
    setCharacter(getCharacterById(db.equippedCharacterId || 'frame_v01'));
    saveDatabase({ gamesPlayed: db.gamesPlayed + 1 });
  }, []);

  // Logic: Audio Init
  useEffect(() => {
    // Using a Cyberpunk/Synthwave track that fits the aesthetic
    const audioUrl = "https://assets.mixkit.co/music/preview/mixkit-deep-urban-future-2144.mp3";
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.4; // 40% volume so it's not overwhelming
    audioRef.current = audio;

    return () => {
        audio.pause();
        audio.currentTime = 0;
    };
  }, []);

  // Logic: Handle Mute/Play State based on Global Prop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isGlobalMuted;

    if (!isGlobalMuted) {
        // Attempt to play if unmuted
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.log("Autoplay prevented by browser in GameRoot.");
                toggleGlobalMute(); 
            });
        }
    } else {
        audio.pause();
    }
  }, [isGlobalMuted, toggleGlobalMute]);

  // Logic: Reset level
  const restartLevel = () => {
    setHealth(100);
    setSpeed(0);
    setIsWon(false);
    setIsDead(false);
    setGameKey(prev => prev + 1);
  };

  // Logic: Next Level
  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
        setLevelIndex(prev => prev + 1);
        restartLevel();
    }
  };

  // Logic: Full Restart
  const restartCampaign = () => {
      setLevelIndex(0);
      // We don't reset credits here anymore, as they are persistent in DB
      restartLevel();
  };

  // Check Death
  useEffect(() => {
    if (health <= 0 && !isDead) {
        setIsDead(true);
        // Save death to DB
        const db = getDatabase();
        saveDatabase({ totalDeaths: db.totalDeaths + 1 });
    }
  }, [health, isDead]);

  // Health Regen Logic (Neon Tech)
  useEffect(() => {
    if (health < 100 && health > 0 && !isWon) {
        const timer = setInterval(() => setHealth(h => Math.min(100, h + 1)), 200);
        return () => clearInterval(timer);
    }
  }, [health, isWon]);

  const handleWin = () => {
    if (!isWon && !isDead) {
        const reward = 100 + (levelIndex * 100);
        
        setLastEarnedCredits(reward);
        setCredits(prev => prev + reward);
        setIsWon(true);

        // Save Progress to DB
        const db = getDatabase();
        saveDatabase({ 
            credits: db.credits + reward,
            highestLevel: Math.max(db.highestLevel, levelIndex + 1)
        });
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-50">
      {/* 3D Scene */}
      <Canvas 
        key={gameKey} 
        gl={{ 
            antialias: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ReinhardToneMapping,
            toneMappingExposure: 1.5
        }} 
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        shadows
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={65} />
          
          {/* --- ATMOSPHERE & LIGHTING --- */}
          <color attach="background" args={['#020205']} />
          <fogExp2 attach="fog" color="#050510" density={0.015} />
          
          <SpaceBackground />
          <Stars radius={120} depth={60} count={3000} factor={4} saturation={0.5} fade speed={0.5} />

          <ambientLight intensity={0.7} />
          <hemisphereLight intensity={0.6} groundColor="#0f172a" color="#e2e8f0" />
          
          {/* Main Key Light */}
          <directionalLight 
              position={[20, 50, 20]} 
              intensity={1.5} 
              color="#e2e8f0" 
              castShadow
              shadow-mapSize={[1024, 1024]}
          />
          
          {/* Rim Light (Backlight) for visual separation */}
          <directionalLight position={[-10, 10, -50]} intensity={2} color={character.colors.secondary} />
          
          {/* Fill Lights */}
          <pointLight position={[-20, 0, -20]} intensity={0.5} color={character.colors.glow} distance={100} />
          <pointLight position={[20, 0, -20]} intensity={0.5} color={character.colors.primary} distance={100} />

          {/* Game Content */}
          <Level config={currentLevel} />
          
          {/* Player with dynamic Level Props */}
          {!isDead && !isWon && (
              <Player 
                  setHealth={setHealth} 
                  setVelocity={setSpeed} 
                  onWin={handleWin}
                  platforms={currentLevel.platforms}
                  goalPosition={currentLevel.goalPosition}
                  characterData={character}
              />
          )}

          {/* --- POST PROCESSING --- */}
          <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={1.0} 
                mipmapBlur 
                intensity={0.6} 
                radius={0.8}
            />
            <Vignette offset={0.4} darkness={0.5} />
          </EffectComposer>

        </Suspense>
      </Canvas>
      
      <Loader 
        containerStyles={{ backgroundColor: '#05050a' }}
        innerStyles={{ width: '300px', backgroundColor: '#1e293b' }}
        barStyles={{ backgroundColor: character.colors.glow, height: '4px' }}
        dataStyles={{ fontFamily: 'monospace', color: character.colors.glow, fontSize: '12px' }}
      />

      {/* HUD Layer */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Top: Status & Objective */}
        <div className="flex justify-between items-start">
           <div className="flex flex-col gap-4">
              {/* Health */}
              <div className="bg-slate-900/80 p-4 rounded border border-slate-700 backdrop-blur w-64 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="text-xs text-slate-400 font-mono mb-1 flex justify-between">
                    <span>ARMOR INTEGRITY</span>
                    <span style={{ color: health < 30 ? 'red' : character.colors.glow }}>{Math.round(health)}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 relative">
                     <MotionDiv 
                       className="absolute top-0 bottom-0 left-0 bg-red-600 z-0"
                       initial={{ width: '100%' }}
                       animate={{ width: `${Math.max(0, health)}%` }}
                       transition={{ duration: 0.5 }}
                     />
                     <MotionDiv 
                       className="absolute top-0 bottom-0 left-0 z-10 mix-blend-screen"
                       style={{ 
                           backgroundColor: character.colors.secondary,
                           boxShadow: `0 0 10px ${character.colors.glow}`
                       }}
                       initial={{ width: '100%' }}
                       animate={{ width: `${Math.max(0, health)}%` }}
                     />
                     {/* Tech Lines Overlay */}
                     <div className="absolute inset-0 z-20 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent 0, transparent 4px, #000 4px, #000 5px)' }} />
                  </div>
              </div>

              {/* Objective Panel */}
              <div className="bg-slate-900/80 p-3 rounded border border-yellow-500/30 backdrop-blur flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 animate-pulse">
                    <Flag size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-yellow-500 font-bold tracking-wider uppercase">{currentLevel.name}</div>
                    <div className="text-sm text-slate-300 font-mono">{currentLevel.description}</div>
                  </div>
              </div>
           </div>

           <div className="flex flex-col items-end gap-3">
               {/* Credits Display */}
               <div className="bg-slate-900/80 p-3 rounded border border-slate-700 backdrop-blur shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 min-w-[140px] justify-end">
                    <div className="text-yellow-400"><Coins size={18} /></div>
                    <div className="text-xl font-bold text-white font-mono tracking-widest">{credits} <span className="text-xs text-slate-500 font-normal">CR</span></div>
               </div>

               {/* Velocity */}
               <div className="bg-slate-900/80 p-4 rounded border border-slate-700 backdrop-blur text-right shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="text-xs text-slate-400 font-mono uppercase">Current Velocity</div>
                  <div className="text-4xl font-bold text-white font-mono tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                      {speed.toString().padStart(3, '0')} <span className="text-sm text-slate-500 font-normal">m/s</span>
                  </div>
               </div>
               
               {/* Audio Toggle */}
               <button 
                onClick={toggleGlobalMute}
                className="pointer-events-auto bg-slate-900/80 p-3 rounded border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 text-slate-400 transition-colors backdrop-blur"
               >
                 {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
               </button>
           </div>
        </div>

        {/* Center: Crosshair */}
        {!isDead && !isWon && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={{ color: character.colors.glow }}>
               <Crosshair size={32} strokeWidth={1} />
            </div>
        )}

        {/* Bottom: Controls */}
        <div className="flex justify-between items-end">
           <div className="bg-black/60 p-4 rounded text-xs text-slate-400 font-mono space-y-1 backdrop-blur-md border border-white/5">
              <div className="flex items-center gap-2"><span style={{ color: character.colors.glow }}>[WASD]</span> Move</div>
              <div className="flex items-center gap-2"><span style={{ color: character.colors.glow }}>[SPACE]</span> Jump / Double Jump</div>
              <div className="flex items-center gap-2"><span style={{ color: character.colors.glow }}>[SHIFT]</span> Phase Dash</div>
           </div>
           
           <button 
             onClick={onExit}
             className="pointer-events-auto bg-red-950/80 hover:bg-red-900 text-red-200 px-6 py-2 rounded font-mono border border-red-900/50 transition-colors flex items-center gap-2 backdrop-blur-sm"
           >
             <RotateCcw size={16} /> TERMINATE
           </button>
        </div>
      </div>

      {/* Win Screen Overlay */}
      <AnimatePresence>
        {isWon && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-sm"
          >
             <MotionDiv 
               initial={{ scale: 0.8, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-slate-900 border border-cyan-500/50 p-10 rounded-xl max-w-md w-full text-center shadow-[0_0_100px_rgba(6,182,212,0.2)] relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                <div className="flex justify-center mb-6 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                   <Award size={80} strokeWidth={1} />
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tighter">
                   {levelIndex < LEVELS.length - 1 ? "SECTOR CLEARED" : "MISSION COMPLETE"}
                </h2>
                
                <div className="w-full h-px bg-cyan-500/50 my-6" />
                
                <div className="mb-8 space-y-2">
                    <p className="text-slate-300 font-mono tracking-wide">DATA CORE INTEGRITY: 100%</p>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-xl bg-yellow-500/10 py-2 rounded border border-yellow-500/20">
                         <Coins size={20} /> REWARD: +{lastEarnedCredits} CR
                    </div>
                </div>
                
                <div className="flex flex-col gap-3 relative z-10">
                   {levelIndex < LEVELS.length - 1 ? (
                       <button 
                         onClick={nextLevel}
                         className="bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] flex items-center justify-center gap-2"
                       >
                         INITIATE NEXT SECTOR <ChevronRight size={20} />
                       </button>
                   ) : (
                       <button 
                         onClick={restartCampaign}
                         className="bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:shadow-[0_0_30px_rgba(5,150,105,0.6)]"
                       >
                         SYSTEM REBOOT
                       </button>
                   )}
                   
                   <button 
                     onClick={restartLevel}
                     className="border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded font-mono transition-colors"
                   >
                     REPLAY SECTOR
                   </button>
                   
                   <button 
                     onClick={onExit}
                     className="border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded font-mono transition-colors flex items-center justify-center gap-2"
                   >
                     <LayoutDashboard size={16} /> RETURN TO BASE
                   </button>
                </div>
             </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Death Screen Overlay */}
      <AnimatePresence>
        {isDead && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-950/90 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-md"
          >
             <MotionDiv 
               initial={{ scale: 1.1 }}
               animate={{ scale: 1 }}
               className="text-center"
             >
                <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-2 tracking-tighter drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">CRITICAL FAILURE</h2>
                <p className="text-red-400 mb-10 text-xl font-mono tracking-widest">SIGNAL LOST</p>
                <button 
                  onClick={restartLevel}
                  className="bg-white text-red-900 hover:bg-red-100 px-8 py-4 rounded font-bold text-xl tracking-wider transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  REINITIALIZE
                </button>
             </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};
