'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TECHNOLOGIES } from '@/lib/data';

interface Props {
  config: { scenarioId?: string };
  participantCount: number;
  responses?: Record<string, any>;
}

const RADIUS = 220;
const CX = 300;
const CY = 300;

export default function TechStackPresenter({ participantCount, responses = {} }: Props) {
  const responseArray = Object.values(responses);
  const total = responseArray.length;
  const revealed = !!responses && Object.keys(responses).length > 0; // Or passed via state

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
    <div className="flex flex-col h-full px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/50 text-sm uppercase tracking-widest">Tech Stack Constellation</h3>
        <span className="text-white/30 text-sm">{total} / {participantCount} submitted</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 600 600" className="w-full max-w-[580px] max-h-[580px]">
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            const opacity = 0.1 + (edge.weight / maxEdge) * 0.7;
            const strokeW = 0.5 + (edge.weight / maxEdge) * 3;
            const aIsTop = topTechs.includes(TECHNOLOGIES[edge.from].id);
            const bIsTop = topTechs.includes(TECHNOLOGIES[edge.to].id);
            const highlight = revealed && aIsTop && bIsTop;
            return (
              <motion.line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={highlight ? '#BEF264' : '#ffffff'}
                strokeOpacity={highlight ? 0.8 : opacity}
                strokeWidth={strokeW}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacity }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
              />
            );
          })}

          {/* Nodes */}
          {TECHNOLOGIES.map((tech, i) => {
            const pos = positions[i];
            const count = techCounts[tech.id] || 0;
            const scale = 1 + (count / maxCount) * 1.8;
            const isTop = revealed && topTechs.includes(tech.id);
            const baseR = 26;
            return (
              <g key={tech.id}>
                {isTop && (
                  <motion.circle
                    cx={pos.x} cy={pos.y}
                    r={baseR * scale + 8}
                    fill="none"
                    stroke="#BEF264"
                    strokeWidth="1.5"
                    strokeOpacity={0.6}
                    animate={{ r: [baseR * scale + 8, baseR * scale + 14, baseR * scale + 8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.circle
                  cx={pos.x} cy={pos.y}
                  fill={tech.color}
                  fillOpacity={0.85}
                  initial={{ r: baseR }}
                  animate={{ r: baseR * scale }}
                  transition={{ type: 'spring', stiffness: 120 }}
                />
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.max(14, 14 * scale)}
                  style={{ userSelect: 'none' }}
                >
                  {tech.emoji}
                </text>
                {count > 0 && (
                  <text
                    x={pos.x} y={pos.y + baseR * scale + 16}
                    textAnchor="middle"
                    fill={isTop ? '#BEF264' : 'white'}
                    fontSize="12"
                    fontWeight={isTop ? 'bold' : 'normal'}
                    fillOpacity={0.9}
                  >
                    {count}
                  </text>
                )}
                <text
                  x={pos.x} y={pos.y + baseR * scale + 30}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fillOpacity={0.4}
                >
                  {tech.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Top stack reveal */}
      {revealed && topTechs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6 py-4 border-t border-[#2a2a2a]"
        >
          <span className="text-white/40 text-sm">Most popular stack:</span>
          {topTechs.map(id => {
            const t = TECHNOLOGIES.find(t => t.id === id)!;
            return (
              <div key={id} className="flex items-center gap-1.5 bg-[#161616] rounded-xl px-3 py-2">
                <span className="text-xl">{t.emoji}</span>
                <span className="text-sm text-white/80">{t.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
