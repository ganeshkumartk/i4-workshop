'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';
import { MYTHS } from '@/lib/data';

interface Props {
  config: { mythIndex?: number };
}

export default function MythBusterParticipant({ config }: Props) {
  const emit = useEmit();
  const [voted, setVoted] = useState<'MYTH' | 'FACT' | null>(null);
  const [startTime] = useState(Date.now());
  const myth = MYTHS[config?.mythIndex ?? 0];

  // Reset on new round
  useEffect(() => { setVoted(null); }, [config?.mythIndex]);

  function vote(choice: 'MYTH' | 'FACT') {
    if (voted) return;
    setVoted(choice);
    emit('submit_response', {
      activityId: 'mythBuster',
      data: { vote: choice, timeMs: Date.now() - startTime },
    });
  }

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Round {(config?.mythIndex ?? 0) + 1} of 4</p>
        <p className="text-xl font-semibold leading-snug text-white max-w-xs">
          {myth?.statement}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!voted ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <button
              onClick={() => vote('MYTH')}
              className="w-full h-24 rounded-2xl bg-red-500 hover:bg-red-400 active:scale-95 text-white font-bold text-3xl transition-all"
            >
              💥 MYTH
            </button>
            <button
              onClick={() => vote('FACT')}
              className="w-full h-24 rounded-2xl bg-[#16A34A] hover:bg-green-500 active:scale-95 text-white font-bold text-3xl transition-all"
            >
              ✅ FACT
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="voted"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <div className="text-6xl">{voted === 'MYTH' ? '💥' : '✅'}</div>
            <p className="text-2xl font-bold text-[#BEF264]">You said: {voted}</p>
            <p className="text-white/50 text-sm">Waiting for the reveal...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
