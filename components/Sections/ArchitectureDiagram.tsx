import React from 'react';
import { motion } from 'framer-motion';

const MotionPath = motion.path as any;

const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full h-[500px] bg-slate-900/40 border border-slate-800 rounded-xl relative overflow-hidden backdrop-blur-sm flex items-center justify-center">
      <div className="absolute top-4 left-4 text-xs font-mono text-cyan-500/50">SYSTEM_TOPOLOGY_V.0.9.4</div>
      
      {/* Visual representation of a flowchart using SVG */}
      <svg width="100%" height="100%" viewBox="0 0 800 400" className="opacity-90">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
          </marker>
        </defs>

        {/* Input to Controller */}
        <MotionPath 
          d="M 150 200 L 300 200" 
          stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
        />
        {/* Controller to Physics */}
        <MotionPath 
          d="M 450 200 L 600 200" 
          stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
        />
        {/* Controller to Anim */}
        <path d="M 375 250 L 375 300" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
        {/* Physics to Anim */}
        <path d="M 675 250 L 675 300 L 450 325" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* Nodes */}
        <g transform="translate(50, 175)">
          <rect width="100" height="50" rx="4" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
          <text x="50" y="30" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">INPUT_SYS</text>
        </g>

        <g transform="translate(300, 175)">
          <rect width="150" height="50" rx="4" fill="#1e293b" stroke="#d946ef" strokeWidth="2" />
          <text x="75" y="30" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">PLAYER_CONTROLLER</text>
        </g>

        <g transform="translate(600, 175)">
          <rect width="150" height="50" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
          <text x="75" y="30" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">PHYSICS_ENGINE</text>
        </g>

        <g transform="translate(300, 300)">
          <rect width="150" height="50" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <text x="75" y="30" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">ANIMATION_IK</text>
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1">
         <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            CORE LOOP ACTIVE
         </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;