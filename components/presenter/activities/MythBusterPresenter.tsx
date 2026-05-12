'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MYTHS } from '@/lib/data';

interface Response {
  data: { vote: 'MYTH' | 'FACT'; timeMs: number; participantName?: string };
  participantName?: string;
  responseCount: number;
  participantCount: number;
}

interface Results {
  myth: number;
  fact: number;
  total: number;
  fastest?: { name: string; timeMs: number }[];
}

interface Props {
  config: { mythIndex?: number };
  participantCount: number;
  responses?: Record<string, any>;
  results?: Results | null;
  onReveal?: (results: Results) => void;
}

export default function MythBusterPresenter({ config, participantCount, responses = {}, results }: Props) {
  const myth = MYTHS[config?.mythIndex ?? 0];
  const [showConfetti, setShowConfetti] = useState(false);
  
  const responseArray = Object.values(responses);
  const total = responseArray.length;
  
  const votes = {
    MYTH: responseArray.filter((r: any) => r.vote === 'MYTH').length,
    FACT: responseArray.filter((r: any) => r.vote === 'FACT').length,
  };
  
  const recentVoter = responseArray.length > 0 ? responseArray[responseArray.length - 1]?.participantName : '';
  const revealed = !!results;

  useEffect(() => {
    if (results && results.myth > results.fact) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [results]);

  const mythPct = total > 0 ? (votes.MYTH / total) * 100 : 50;
  const factPct = total > 0 ? (votes.FACT / total) * 100 : 50;

  return (
    <div className="flex flex-col h-full px-12 py-8 relative overflow-hidden font-mono">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 border-2 border-black dark:border-white"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#BEF264', '#16A34A', '#EF4444', '#F59E0B', '#3B82F6'][i % 5],
                top: -20,
              }}
              animate={{
                y: ['0vh', '110vh'],
                rotate: [0, Math.random() * 720 - 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Statement */}
      <motion.div
        key={myth?.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 border-8 border-black dark:border-white p-8 bg-[#BEF264] dark:bg-[#0000FF] shadow-[12px_12px_0px_rgba(255,0,0,1)]"
      >
        <p className="text-black dark:text-white text-sm font-bold tracking-widest mb-4">
          ROUND {(config?.mythIndex ?? 0) + 1} / 4
        </p>
        <h2 className="text-4xl md:text-5xl font-black leading-none text-black dark:text-white uppercase tracking-tighter">
          {myth?.statement}
        </h2>
      </motion.div>

      {/* Live vote split */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="w-full max-w-3xl space-y-8">
          {/* MYTH bar */}
          <div className="flex flex-col gap-2">
            <span className="text-[#FF0000] font-black text-2xl tracking-tighter">MYTH</span>
            <div className="w-full h-20 border-4 border-black dark:border-white bg-transparent relative">
              <motion.div
                className="h-full bg-[#FF0000] flex items-center justify-end pr-6 border-r-4 border-black dark:border-white"
                initial={{ width: '0%' }}
                animate={{ width: `${mythPct}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              >
                {votes.MYTH > 0 && (
                  <span className="text-white font-black text-3xl">{votes.MYTH}</span>
                )}
              </motion.div>
              <span className="absolute top-1/2 -translate-y-1/2 right-4 text-black dark:text-white font-bold mix-blend-difference">{Math.round(mythPct)}%</span>
            </div>
          </div>

          {/* FACT bar */}
          <div className="flex flex-col gap-2">
            <span className="text-[#16A34A] font-black text-2xl tracking-tighter">FACT</span>
            <div className="w-full h-20 border-4 border-black dark:border-white bg-transparent relative">
              <motion.div
                className="h-full bg-[#16A34A] flex items-center justify-end pr-6 border-r-4 border-black dark:border-white"
                initial={{ width: '0%' }}
                animate={{ width: `${factPct}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              >
                {votes.FACT > 0 && (
                  <span className="text-white font-black text-3xl">{votes.FACT}</span>
                )}
              </motion.div>
              <span className="absolute top-1/2 -translate-y-1/2 right-4 text-black dark:text-white font-bold mix-blend-difference">{Math.round(factPct)}%</span>
            </div>
          </div>
        </div>

        {/* Recent voter bubble */}
        <AnimatePresence mode="wait">
          {recentVoter && !revealed && (
            <motion.div
              key={recentVoter + total}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="border-2 border-black dark:border-white px-4 py-2 bg-yellow-400 text-black font-bold uppercase"
            >
              + {recentVoter} VOTED
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal result */}
        <AnimatePresence>
          {revealed && results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 border-8 border-black dark:border-white p-8 bg-[#FF0000] text-white shadow-[16px_16px_0px_rgba(190,242,100,1)] z-10"
            >
              <div className="text-6xl md:text-8xl font-black tracking-tighter leading-none">BUSTED!</div>
              <p className="text-2xl md:text-4xl font-bold">{myth?.bust}</p>
              {results.fastest && results.fastest.length > 0 && (
                <div className="border-t-4 border-white pt-4 mt-4">
                  <p className="text-sm font-bold tracking-widest">FASTEST NODE</p>
                  <p className="text-2xl font-black">{results.fastest[0]?.name}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
