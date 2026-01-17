
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Hexagon, Lock, Unlock, CheckCircle, Package } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { getDatabase, saveDatabase } from '../../utils/database';
import { CHARACTERS } from '../../data/characters';
import { PlayerStats, CharacterData } from '../../types';
import { PlayerModel } from '../Game/Player';

const ROLL_COST = 500;

const CharacterPreview: React.FC<{ character: CharacterData }> = ({ character }) => {
  return (
    <group>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, -1, 0]}>
                <PlayerModel 
                    velocity={new THREE.Vector3(0,0,0)} 
                    isGrounded={true} 
                    colors={character.colors} 
                    modelType={character.modelType}
                />
            </group>
        </Float>
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight 
            position={[5, 5, 5]} 
            intensity={2} 
            color={character.colors.primary} 
            castShadow 
        />
        <pointLight 
            position={[-5, 0, -5]} 
            intensity={3} 
            color={character.colors.glow} 
            distance={10}
        />
    </group>
  );
};

export const ShopView: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<{ char: CharacterData, isNew: boolean } | null>(null);

  useEffect(() => {
    setStats(getDatabase());
  }, []);

  const handleRoll = () => {
    if (!stats || stats.credits < ROLL_COST || isRolling) return;

    // Deduct Cost immediately
    const newCredits = stats.credits - ROLL_COST;
    setStats(prev => prev ? ({ ...prev, credits: newCredits }) : null);
    saveDatabase({ credits: newCredits });
    
    setIsRolling(true);
    setRollResult(null);

    // Simulation delay
    setTimeout(() => {
      // RNG Logic
      const rand = Math.random();
      let pool = CHARACTERS.filter(c => c.rarity === 'COMMON');
      if (rand > 0.9) pool = CHARACTERS.filter(c => c.rarity === 'LEGENDARY');
      else if (rand > 0.6) pool = CHARACTERS.filter(c => c.rarity === 'RARE');

      const selected = pool[Math.floor(Math.random() * pool.length)];
      const isOwned = stats.inventory.includes(selected.id);
      
      let finalCredits = newCredits;
      let newInventory = [...stats.inventory];

      if (isOwned) {
        // Refund half
        finalCredits += (ROLL_COST / 2);
      } else {
        newInventory.push(selected.id);
      }

      const updatedStats = saveDatabase({ 
        credits: finalCredits, 
        inventory: newInventory 
      });

      setStats(updatedStats);
      setRollResult({ char: selected, isNew: !isOwned });
      setIsRolling(false);
    }, 2000);
  };

  const handleEquip = (id: string) => {
    if (!stats?.inventory.includes(id)) return;
    const updated = saveDatabase({ equippedCharacterId: id });
    setStats(updated);
  };

  if (!stats) return null;

  return (
    <div className="space-y-8">
       {/* Header */}
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="text-cyan-500" /> SUPPLY DROP
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              Acquire new chassis frames.
            </p>
          </div>
          <div className="bg-slate-900 border border-yellow-500/30 px-4 py-2 rounded flex items-center gap-3">
             <Coins className="text-yellow-500" size={20} />
             <span className="text-2xl font-bold font-mono text-white">{stats.credits}</span>
          </div>
       </div>

       {/* Gacha Section */}
       <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div 
                key="rolling"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center gap-4"
              >
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                   className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full"
                 />
                 <div className="text-cyan-400 font-mono tracking-widest animate-pulse">DECRYPTING SIGNAL...</div>
              </motion.div>
            ) : rollResult ? (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-center w-full max-w-lg"
               >
                 <div className={`text-sm font-bold font-mono tracking-widest mb-2 ${
                   rollResult.char.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                   rollResult.char.rarity === 'RARE' ? 'text-purple-400' : 'text-slate-400'
                 }`}>
                   {rollResult.char.rarity} DROP
                 </div>
                 
                 {/* 3D Preview */}
                 <div className="w-full h-64 mx-auto mb-6 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                    <Canvas shadows>
                        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
                        <CharacterPreview character={rollResult.char} />
                        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={4} />
                        <Environment preset="city" />
                    </Canvas>
                    <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-mono pointer-events-none">PREVIEW_MODE</div>
                 </div>

                 <h3 className="text-3xl font-bold text-white mb-2 uppercase">{rollResult.char.name}</h3>
                 <p className="text-slate-400 mb-6 max-w-md mx-auto">{rollResult.char.description}</p>
                 
                 {rollResult.isNew ? (
                   <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded font-mono inline-block">
                     NEW FRAME UNLOCKED
                   </div>
                 ) : (
                   <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded font-mono inline-block">
                     DUPLICATE DETECTED - REFUNDED {ROLL_COST / 2} CR
                   </div>
                 )}

                 <div className="mt-8">
                    <button 
                      onClick={() => setRollResult(null)}
                      className="text-slate-400 hover:text-white underline underline-offset-4"
                    >
                      Return to Supply
                    </button>
                 </div>
               </motion.div>
            ) : (
              <motion.div key="idle" className="text-center z-10">
                 <Hexagon size={80} className="text-cyan-500 mx-auto mb-6 opacity-80" strokeWidth={1} />
                 <h3 className="text-2xl font-bold text-white mb-2">INITIATE SUPPLY DROP</h3>
                 <p className="text-slate-400 mb-8">Contains 1 random chassis frame.</p>
                 
                 <button
                   onClick={handleRoll}
                   disabled={stats.credits < ROLL_COST}
                   className={`px-8 py-4 rounded font-bold text-xl tracking-wider flex items-center gap-3 transition-all ${
                     stats.credits >= ROLL_COST 
                     ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' 
                     : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                   }`}
                 >
                   <Coins size={20} /> 
                   {ROLL_COST} CREDITS
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Background Grid */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
          />
       </div>

       {/* Inventory Grid */}
       <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">FRAME INVENTORY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {CHARACTERS.map((char) => {
               const isOwned = stats.inventory.includes(char.id);
               const isEquipped = stats.equippedCharacterId === char.id;

               return (
                 <div 
                   key={char.id}
                   className={`relative p-4 rounded-lg border transition-all ${
                     isOwned 
                     ? 'bg-slate-900/60 border-slate-700 hover:border-cyan-500/50' 
                     : 'bg-slate-950 border-slate-800 opacity-60'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-3">
                       {/* Mini Canvas for Icon */}
                       <div className={`w-12 h-12 rounded border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden relative ${isOwned ? 'bg-slate-800' : 'bg-slate-950'}`}
                            style={{ borderColor: isOwned ? char.colors.glow : '#334155' }}>
                            {isOwned && (
                                <Canvas frameloop="demand">
                                    <ambientLight intensity={1} />
                                    <pointLight position={[2,2,2]} color={char.colors.glow} />
                                    <mesh rotation={[0.4, 0.4, 0]} scale={0.6}>
                                        <boxGeometry />
                                        <meshStandardMaterial color={char.colors.primary} />
                                    </mesh>
                                </Canvas>
                            )}
                       </div>

                       <div className="text-right">
                         {isOwned ? (
                            isEquipped ? (
                              <span className="text-green-500 flex items-center gap-1 text-xs font-bold bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                                <CheckCircle size={10} /> ACTIVE
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleEquip(char.id)}
                                className="text-cyan-400 text-xs font-mono hover:bg-cyan-900/30 px-2 py-1 rounded transition-colors"
                              >
                                EQUIP
                              </button>
                            )
                         ) : (
                           <Lock size={16} className="text-slate-600" />
                         )}
                       </div>
                    </div>
                    
                    <h4 className={`font-bold font-mono uppercase ${isOwned ? 'text-white' : 'text-slate-500'}`}>
                      {char.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3 h-8 line-clamp-2">{char.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                         char.rarity === 'LEGENDARY' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                         char.rarity === 'RARE' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                         'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                       }`}>
                         {char.rarity}
                       </span>
                    </div>
                 </div>
               );
             })}
          </div>
       </div>
    </div>
  );
};
