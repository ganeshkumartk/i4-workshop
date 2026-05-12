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
    <div className="flex flex-col h-full px-12 py-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#BEF264', '#16A34A', '#EF4444', '#F59E0B', '#3B82F6'][i % 5],
                top: -20,
              }}
              animate={{
                y: ['0vh', '110vh'],
                rotate: [0, Math.random() * 720 - 360],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeIn',
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
        className="text-center mb-8"
      >
        <p className="text-white/30 text-sm uppercase tracking-widest mb-3">
          Round {(config?.mythIndex ?? 0) + 1} of 4
        </p>
        <h2 className="text-4xl font-bold text-white leading-tight max-w-2xl mx-auto">
          {myth?.statement}
        </h2>
      </motion.div>

      {/* Live vote split */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-2xl space-y-4">
          {/* MYTH bar */}
          <div className="flex items-center gap-4">
            <span className="text-red-400 font-bold w-20 text-right text-lg">MYTH 💥</span>
            <div className="flex-1 h-14 bg-[#1a1a1a] rounded-2xl overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 flex items-center justify-end pr-4 rounded-2xl"
                initial={{ width: '0%' }}
                animate={{ width: `${mythPct}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              >
                {votes.MYTH > 0 && (
                  <span className="text-white font-bold text-xl">{votes.MYTH}</span>
                )}
              </motion.div>
            </div>
            <span className="text-white/40 w-10 text-sm">{Math.round(mythPct)}%</span>
          </div>

          {/* FACT bar */}
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-bold w-20 text-right text-lg">FACT ✅</span>
            <div className="flex-1 h-14 bg-[#1a1a1a] rounded-2xl overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-700 to-green-500 flex items-center justify-end pr-4 rounded-2xl"
                initial={{ width: '0%' }}
                animate={{ width: `${factPct}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              >
                {votes.FACT > 0 && (
                  <span className="text-white font-bold text-xl">{votes.FACT}</span>
                )}
              </motion.div>
            </div>
            <span className="text-white/40 w-10 text-sm">{Math.round(factPct)}%</span>
          </div>
        </div>

        {/* Recent voter bubble */}
        <AnimatePresence mode="wait">
          {recentVoter && !revealed && (
            <motion.p
              key={recentVoter + total}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/40 text-sm"
            >
              {recentVoter} just voted
            </motion.p>
          )}
        </AnimatePresence>

        {/* Reveal result */}
        <AnimatePresence>
          {revealed && results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3"
            >
              <div className="text-6xl">💥 BUSTED!</div>
              <p className="text-2xl font-bold text-[#BEF264]">{myth?.bust}</p>
              {results.fastest && results.fastest.length > 0 && (
                <p className="text-white/40 text-sm">
                  Fastest correct: <span className="text-white">{results.fastest[0]?.name}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom counter */}
      <div className="text-center text-white/30 text-sm mt-4">
        {total} of {participantCount} voted
      </div>
    </div>
  );
}
