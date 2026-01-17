
import React, { useState, useRef, useEffect } from 'react';
import { 
  Move3d, 
  Sword, 
  Globe, 
  Cpu, 
  LayoutDashboard, 
  Database,
  Terminal,
  PlayCircle,
  Volume2, 
  VolumeX,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CityScene } from './components/Visuals/CityScene';
import { SystemCard } from './components/UI/SystemCard';
import ArchitectureDiagram from './components/Sections/ArchitectureDiagram';
import { DatabaseView } from './components/Sections/DatabaseView'; 
import { ShopView } from './components/Sections/ShopView'; // New Import
import { GameRoot } from './components/Game/GameRoot';
import { MOVEMENT_DATA, COMBAT_DATA } from './data/gameDesign';
import { SystemSection, GameMode } from './types';
import { SYSTEMS_NAV } from './constants';

const MotionDiv = motion.div as any;

const ICON_MAP: { [key: string]: any } = {
  LayoutDashboard,
  Move3d,
  Sword,
  Globe,
  Cpu,
  Database,
  Box
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SystemSection>(SystemSection.OVERVIEW);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SIMULATION); // Default to Playable
  
  // --- Global Audio State ---
  const [isMuted, setIsMuted] = useState(false);
  const menuAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Menu Music
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/music/preview/mixkit-slow-trail-2443.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    menuAudioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  // Handle Menu Audio Playback logic
  useEffect(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;

    audio.muted = isMuted;

    if (gameMode === GameMode.ARCHITECT && !isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.log("Menu Audio autoplay prevented.");
          const resumeAudio = () => {
            if (audio.muted === false) {
                 audio.play().catch(e => console.log("Still blocked", e));
            }
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
          };
          
          document.addEventListener('click', resumeAudio);
          document.addEventListener('keydown', resumeAudio);
        });
      }
    } else {
      audio.pause();
    }
  }, [gameMode, isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  if (gameMode === GameMode.SIMULATION) {
    return (
        <GameRoot 
            onExit={() => setGameMode(GameMode.ARCHITECT)} 
            isGlobalMuted={isMuted} 
            toggleGlobalMute={toggleMute}
        />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case SystemSection.MOVEMENT:
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Advanced Traversal</h2>
                  <p className="text-slate-400 max-w-2xl">Momentum-based movement system designed for high-velocity gameplay.</p>
                </div>
                <div className="bg-cyan-900/30 border border-cyan-500/30 px-4 py-2 rounded text-cyan-400 font-mono text-sm">
                  PHYSICS_TICK: 60HZ
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {MOVEMENT_DATA.map((feature, i) => (
                 <SystemCard key={i} feature={feature} index={i} />
               ))}
             </div>
          </div>
        );
      
      case SystemSection.COMBAT:
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Dynamic Combat</h2>
                  <p className="text-slate-400 max-w-2xl">Hybrid melee-ranged system with time-dilation capabilities.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {COMBAT_DATA.map((feature, i) => (
                 <SystemCard key={i} feature={feature} index={i} />
               ))}
             </div>
          </div>
        );

      case SystemSection.ARCHITECTURE:
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">System Architecture</h2>
                  <p className="text-slate-400 max-w-2xl">Data-oriented design ensuring high performance.</p>
                </div>
             </div>
             <ArchitectureDiagram />
          </div>
        );

      case SystemSection.WORLD:
        return (
           <div className="space-y-6">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">World & AI Design</h2>
                <p className="text-slate-400">The "Fracture" - A semi-open world divided into vertical districts.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="text-cyan-500" size={20} /> Districts
                  </h3>
                  <ul className="space-y-4">
                    <li className="border-l-2 border-cyan-500 pl-4">
                      <div className="text-white font-bold">The Core</div>
                      <p className="text-sm text-slate-400">Pristine neon aesthetic.</p>
                    </li>
                    <li className="border-l-2 border-magenta-500 pl-4">
                      <div className="text-white font-bold">Fracture Zero</div>
                      <p className="text-sm text-slate-400">Broken physics anomaly.</p>
                    </li>
                  </ul>
                </div>
             </div>
           </div>
        );

      case SystemSection.DATABASE:
        return <DatabaseView />;

      case SystemSection.SHOP:
        return <ShopView />;

      default: // OVERVIEW
        return (
          <div className="text-center space-y-12 py-10">
            <MotionDiv 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-magenta-500 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                NEON FRACTURE
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                System Architect & Simulation Engine.
              </p>
            </MotionDiv>

            <button 
              onClick={() => setGameMode(GameMode.SIMULATION)}
              className="group relative px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded hover:bg-cyan-500 transition-all tracking-widest uppercase flex items-center justify-center gap-3 mx-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
              <PlayCircle size={24} />
              INITIATE SIMULATION
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden flex flex-col md:flex-row">
      <CityScene />
      <nav className="w-full md:w-64 bg-black/80 backdrop-blur-md border-r border-slate-800 flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-slate-800">
           <div className="text-xs font-mono text-cyan-500 mb-1">PROJECT_CODENAME</div>
           <div className="font-bold text-xl tracking-wider text-white">NEON FRACTURE</div>
           <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"/>
              <span className="text-xs text-slate-500 font-mono">ARCHITECT MODE</span>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {SYSTEMS_NAV.map((item) => {
             const Icon = ICON_MAP[item.icon] || Terminal;
             const isActive = activeTab === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id as SystemSection)}
                 className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all relative ${
                    isActive 
                    ? 'text-cyan-400 bg-cyan-900/20 border-r-2 border-cyan-400' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                 <Icon size={18} />
                 <span className="font-medium tracking-wide text-sm">{item.label}</span>
               </button>
             );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800">
            <button 
                onClick={toggleMute}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 transition-colors text-slate-400"
            >
                <div className="flex items-center gap-2 text-xs font-mono">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    {isMuted ? "SYSTEM MUTED" : "AUDIO ACTIVE"}
                </div>
            </button>
        </div>
      </nav>
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
           <AnimatePresence mode="wait">
             <MotionDiv
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
               {renderContent()}
             </MotionDiv>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
