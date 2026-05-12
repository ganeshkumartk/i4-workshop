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
    <div className="flex flex-col h-full px-6 py-6 relative">
      <div className="text-center mb-12 relative z-10">
        <p className="opacity-50 text-sm uppercase tracking-widest font-medium mb-2">Scenario</p>
        <h2 className="text-2xl font-bold max-w-3xl mx-auto leading-relaxed drop-shadow-md">
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
              stroke="currentColor"
              strokeWidth={Math.min(e.weight * 2, 10)}
              className="opacity-20"
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
                className={`relative flex items-center justify-center rounded-full shadow-lg ${
                  revealed && isTop ? 'bg-linear-to-br from-[#BEF264] to-[#16A34A] text-black shadow-green-500/30' : 'bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10'
                }`}
                animate={{
                  width: revealed ? 50 + (count / maxCount) * 40 : 50,
                  height: revealed ? 50 + (count / maxCount) * 40 : 50,
                }}
              >
                <span className="text-2xl z-10">{tech.emoji}</span>
                {revealed && count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {count}
                  </motion.div>
                )}
              </motion.div>
              <span className={`text-xs font-bold ${revealed && isTop ? 'text-[#16A34A] drop-shadow-md' : 'opacity-60'}`}>
                {tech.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center opacity-40 text-sm mt-4 font-medium">
        {total} of {participantCount} submitted
      </div>
    </div>
  );
}
