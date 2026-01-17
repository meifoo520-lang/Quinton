import React from 'react';
import { motion } from 'framer-motion';
import { MechanicFeature } from '../../types';
import { Code, Cpu } from 'lucide-react';

const MotionDiv = motion.div as any;

interface Props {
  feature: MechanicFeature;
  index: number;
}

export const SystemCard: React.FC<Props> = ({ feature, index }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-lg hover:border-cyan-500/50 transition-colors group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-cyan-900/20 rounded-md text-cyan-400 group-hover:text-cyan-300">
          <Cpu size={20} />
        </div>
        <h3 className="text-xl font-bold font-mono tracking-wider text-slate-100 uppercase">
          {feature.title}
        </h3>
      </div>
      
      <p className="text-slate-300 mb-4 leading-relaxed">
        {feature.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
          <Code size={12} /> Technical Implementation
        </div>
        <ul className="space-y-2">
          {feature.technicalDetails.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="mt-1.5 w-1 h-1 bg-magenta-500 rounded-full shrink-0" />
              <span className="font-mono">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </MotionDiv>
  );
};