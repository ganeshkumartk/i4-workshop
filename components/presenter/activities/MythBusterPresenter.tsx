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
    <div className="flex flex-col h-full px-12 py-12 relative font-sans">
      <motion.div
        key={myth?.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="text-center mb-12"
      >
        <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em] mb-6">
          Statement {(config?.mythIndex ?? 0) + 1} of 4
        </p>
        <h2 className="text-4xl font-serif font-light text-[#1C1C1C] leading-[1.3] max-w-3xl mx-auto">
          &ldquo;{myth?.statement}&rdquo;
        </h2>
      </motion.div>

      {/* Live vote split */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="w-full max-w-3xl space-y-8">
          {/* MYTH bar */}
          <div className="flex items-center gap-6">
            <span className="text-[#8B4A34] font-medium tracking-[0.1em] w-24 text-right text-xs uppercase">Myth</span>
            <div className="flex-1 h-1 bg-[#E8E4DF] relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#8B4A34]"
                initial={{ width: '0%' }}
                animate={{ width: `${mythPct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              />
              <motion.div 
                className="absolute -top-8 text-[#8B4A34] font-serif text-2xl transform -translate-x-1/2"
                initial={{ left: '0%' }}
                animate={{ left: `${mythPct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                {votes.MYTH > 0 ? votes.MYTH : ''}
              </motion.div>
            </div>
            <span className="text-[#6B6560] w-12 text-xs tracking-wider">{Math.round(mythPct)}%</span>
          </div>

          {/* FACT bar */}
          <div className="flex items-center gap-6">
            <span className="text-[#7A8B76] font-medium tracking-[0.1em] w-24 text-right text-xs uppercase">Fact</span>
            <div className="flex-1 h-1 bg-[#E8E4DF] relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#7A8B76]"
                initial={{ width: '0%' }}
                animate={{ width: `${factPct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              />
              <motion.div 
                className="absolute -top-8 text-[#7A8B76] font-serif text-2xl transform -translate-x-1/2"
                initial={{ left: '0%' }}
                animate={{ left: `${factPct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                {votes.FACT > 0 ? votes.FACT : ''}
              </motion.div>
            </div>
            <span className="text-[#6B6560] w-12 text-xs tracking-wider">{Math.round(factPct)}%</span>
          </div>
        </div>

        {/* Recent voter bubble */}
        <div className="h-6">
          <AnimatePresence mode="wait">
            {recentVoter && !revealed && (
              <motion.p
                key={recentVoter + total}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[#6B6560] text-xs italic"
              >
                {recentVoter} responded
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Reveal result */}
        <AnimatePresence>
          {revealed && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="text-center space-y-6 mt-8"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#8B7D56]">The Reality</div>
              <p className="text-2xl font-serif text-[#1C1C1C] max-w-2xl leading-relaxed mx-auto">
                {myth?.bust}
              </p>
              {results.fastest && results.fastest.length > 0 && (
                <p className="text-[#6B6560] text-xs pt-4 border-t border-[#E8E4DF] w-fit mx-auto px-8">
                  Fastest correct response: <span className="text-[#1C1C1C] font-medium">{results.fastest[0]?.name}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom counter */}
      <div className="text-center text-[#8D8881] text-[10px] uppercase tracking-[0.2em] mt-8">
        {total} of {participantCount} submitted
      </div>
    </div>
  );
}
