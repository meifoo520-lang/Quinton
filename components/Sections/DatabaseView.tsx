
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDatabase, resetDatabase } from '../../utils/database';
import { PlayerStats } from '../../types';
import { Database, Skull, Coins, Trophy, Clock, RefreshCw } from 'lucide-react';

const MotionDiv = motion.div as any;

export const DatabaseView: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setStats(getDatabase());
  }, []);

  const handleReset = () => {
    if (window.confirm("WARNING: This will purge all user data. Continue?")) {
      setStats(resetDatabase());
    }
  };

  if (!stats) return <div className="p-4 text-slate-500 font-mono animate-pulse">CONNECTING TO DATABASE...</div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Database className="text-cyan-500" /> USER_DATABASE
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              ID: NF-USER-{Math.floor(Math.random() * 99999).toString().padStart(5, '0')} // STATUS: ONLINE
            </p>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-red-900/50 text-red-500 hover:bg-red-900/20 hover:text-red-400 rounded font-mono text-xs transition-colors"
          >
            <RefreshCw size={14} /> PURGE DATA
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CREDITS */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 border border-yellow-500/20 p-6 rounded-lg relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins size={60} />
             </div>
             <div className="text-yellow-500 text-xs font-mono mb-2 uppercase tracking-widest">Available Credits</div>
             <div className="text-4xl font-bold text-white font-mono">{stats.credits.toLocaleString()}</div>
             <div className="text-xs text-slate-500 mt-2">Currency used for upgrades.</div>
          </MotionDiv>

          {/* LEVEL */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/60 border border-cyan-500/20 p-6 rounded-lg relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={60} />
             </div>
             <div className="text-cyan-500 text-xs font-mono mb-2 uppercase tracking-widest">Clearance Level</div>
             <div className="text-4xl font-bold text-white font-mono">Lvl {stats.highestLevel}</div>
             <div className="text-xs text-slate-500 mt-2">Highest sector reached.</div>
          </MotionDiv>

          {/* DEATHS */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/60 border border-red-500/20 p-6 rounded-lg relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Skull size={60} />
             </div>
             <div className="text-red-500 text-xs font-mono mb-2 uppercase tracking-widest">Casualties</div>
             <div className="text-4xl font-bold text-white font-mono">{stats.totalDeaths}</div>
             <div className="text-xs text-slate-500 mt-2">Total simulation failures.</div>
          </MotionDiv>

          {/* GAMES */}
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/60 border border-purple-500/20 p-6 rounded-lg relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock size={60} />
             </div>
             <div className="text-purple-500 text-xs font-mono mb-2 uppercase tracking-widest">Simulations</div>
             <div className="text-4xl font-bold text-white font-mono">{stats.gamesPlayed}</div>
             <div className="text-xs text-slate-500 mt-2">Total runs initiated.</div>
          </MotionDiv>
       </div>

       {/* LOGS */}
       <div className="mt-8 bg-black/40 border border-slate-800 rounded-lg p-6 font-mono text-sm h-64 overflow-y-auto">
          <div className="text-slate-500 mb-4 border-b border-slate-800 pb-2 flex justify-between">
            <span>SYSTEM LOGS</span>
            <span>{new Date(stats.lastLogin).toLocaleDateString()}</span>
          </div>
          <div className="space-y-2 text-slate-400">
             <div><span className="text-green-500">[SUCCESS]</span> Connection established.</div>
             {stats.credits > 0 && <div><span className="text-yellow-500">[INFO]</span> Credit balance retrieved: {stats.credits} CR</div>}
             {stats.highestLevel > 0 && <div><span className="text-cyan-500">[INFO]</span> Clearance granted for Sector 0{stats.highestLevel + 1}.</div>}
             {stats.totalDeaths > 10 && <div><span className="text-red-500">[WARNING]</span> High casualty rate detected. Recommend training.</div>}
             <div><span className="text-slate-600">[SYSTEM]</span> Waiting for input...</div>
          </div>
       </div>
    </div>
  );
};
