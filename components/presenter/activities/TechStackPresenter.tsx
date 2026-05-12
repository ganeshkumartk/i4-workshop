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
      x: CX + RADIUS * Math.cos(angle),
      y: CY + RADIUS * Math.sin(angle),
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
    <div className="flex flex-col h-full px-8 py-8 relative font-mono uppercase">
      <div className="text-center mb-16 relative z-10 border-8 border-black dark:border-white p-8 bg-white dark:bg-black shadow-[16px_16px_0px_rgba(0,0,255,1)]">
        <p className="text-sm font-bold tracking-widest mb-4 bg-black text-white dark:bg-white dark:text-black inline-block px-4 py-1">SCENARIO</p>
        <h2 className="text-3xl md:text-5xl font-black max-w-4xl mx-auto leading-none tracking-tighter text-black dark:text-white">
          {scenario?.text}
        </h2>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
          {revealed && edges.map((e, i) => (
            <motion.line
              key={`e-${i}`}
              x1={positions[e.from].x} y1={positions[e.from].y}
              x2={positions[e.to].x} y2={positions[e.to].y}
              stroke="currentColor"
              strokeWidth={Math.max(2, Math.min(e.weight * 4, 16))}
              className="text-black dark:text-white opacity-20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.05 }}
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
              style={{ left: pos.x, top: pos.y }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <motion.div
                className={`relative flex items-center justify-center border-4 border-black dark:border-white ${
                  revealed && isTop ? 'bg-[#BEF264] text-black' : 'bg-white dark:bg-black text-black dark:text-white'
                }`}
                animate={{
                  width: revealed ? 60 + (count / maxCount) * 40 : 60,
                  height: revealed ? 60 + (count / maxCount) * 40 : 60,
                }}
              >
                <span className="text-3xl z-10">{tech.emoji}</span>
                {revealed && count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 -right-4 bg-[#FF0000] text-white text-lg font-black px-3 py-1 border-2 border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  >
                    {count}
                  </motion.div>
                )}
              </motion.div>
              <span className={`text-sm font-black px-2 py-1 border-2 border-black dark:border-white ${revealed && isTop ? 'bg-black text-[#BEF264] dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'}`}>
                {tech.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center font-bold text-sm mt-8 border-t-4 border-black dark:border-white pt-4 flex justify-between">
        <span>STATUS: ACTIVE</span>
        <span className="bg-[#0000FF] text-white px-4 py-1 border-2 border-black dark:border-white">
          {total} / {participantCount} LOGGED
        </span>
      </div>
    </div>
  );
}
