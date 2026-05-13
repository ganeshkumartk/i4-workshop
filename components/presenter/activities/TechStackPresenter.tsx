'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TECHNOLOGIES } from '@/lib/data';
import { getScenario } from '@/lib/activityEngine';

interface Props {
  config: { scenarioId?: string };
  participantCount: number;
  responses?: Record<string, any>;
}

const RADIUS = 220;
const CX = 300;
const CY = 300;

export default function TechStackPresenter({ config, participantCount, responses = {} }: Props) {
  const responseArray = Object.values(responses);
  const total = responseArray.length;
  const revealed = !!responses && Object.keys(responses).length > 0; // Or passed via state

  const scenario = getScenario(config?.scenarioId);

  const techCounts: Record<string, number> = {};
  const coOccurrence: Record<string, Record<string, number>> = {};

  for (const r of responseArray) {
    const picks = (r as any).picks || [];
    picks.forEach((a: string) => {
      techCounts[a] = (techCounts[a] || 0) + 1;
      picks.forEach((b: string) => {
        if (a !== b) {
          coOccurrence[a] = coOccurrence[a] || {};
          coOccurrence[a][b] = (coOccurrence[a][b] || 0) + 1;
        }
      });
    });
  }

  // Node positions on a circle
  const positions = TECHNOLOGIES.map((_, i) => {
    const angle = (i / TECHNOLOGIES.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: `calc(50% + ${RADIUS * Math.cos(angle)}px)`,
      y: `calc(50% + ${RADIUS * Math.sin(angle)}px)`,
    };
  });

  const maxCount = Math.max(1, ...Object.values(techCounts));

  // Build edges
  const edges: { from: number; to: number; weight: number }[] = [];
  TECHNOLOGIES.forEach((techA, i) => {
    TECHNOLOGIES.forEach((techB, j) => {
      if (i < j && coOccurrence[techA.id]?.[techB.id]) {
        edges.push({ from: i, to: j, weight: coOccurrence[techA.id][techB.id] });
      }
    });
  });
  const maxEdge = Math.max(1, ...edges.map(e => e.weight));

  const topTechs = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  return (
    <div className="flex flex-col h-full px-12 py-12 relative font-sans">
      <div className="text-center mb-16 relative z-10">
        <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em] mb-6">Scenario</p>
        <h2 className="text-3xl font-serif font-light text-[#1C1C1C] max-w-4xl mx-auto leading-relaxed">
          {scenario?.text}
        </h2>
      </div>

      <div className="flex-1 relative">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {revealed && edges.map((e, i) => (
            <motion.line
              key={`e-${i}`}
              x1={positions[e.from].x} y1={positions[e.from].y}
              x2={positions[e.to].x} y2={positions[e.to].y}
              stroke="#D4CFC8"
              strokeWidth={Math.min(e.weight * 1.5, 6)}
              className="opacity-60"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
            />
          ))}
        </svg>

        {positions.map((pos, i) => {
          const tech = TECHNOLOGIES[i];
          const count = techCounts[tech.id] || 0;
          const isTop = topTechs.includes(tech.id);
          
          return (
            <motion.div
              key={tech.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
              style={{ left: pos.x, top: pos.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
              <motion.div
                className={`relative flex items-center justify-center rounded-full transition-colors duration-1000 ${
                  revealed && isTop 
                    ? 'bg-[#F9F8F6] border border-[#8B7D56] shadow-sm' 
                    : 'bg-white border border-[#E8E4DF] grayscale opacity-70'
                }`}
                animate={{
                  width: revealed ? 60 + (count / maxCount) * 40 : 60,
                  height: revealed ? 60 + (count / maxCount) * 40 : 60,
                }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                <span className="text-2xl z-10" style={{ filter: revealed && isTop ? 'none' : 'grayscale(100%)' }}>{tech.emoji}</span>
                {revealed && count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-1 -right-1 bg-[#1C1C1C] text-white text-[10px] font-sans w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.div>
                )}
              </motion.div>
              <span className={`text-[10px] tracking-wide uppercase font-medium ${revealed && isTop ? 'text-[#8B7D56]' : 'text-[#8D8881]'}`}>
                {tech.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-[#8D8881] text-[10px] uppercase tracking-[0.2em] mt-8">
        {total} of {participantCount} submitted
      </div>
    </div>
  );
}
