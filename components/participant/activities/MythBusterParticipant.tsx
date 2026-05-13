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
    <div className="flex flex-col h-full items-center justify-center px-8 gap-12 font-sans bg-[#F9F8F6]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="text-center"
      >
        <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em] mb-4">Statement {(config?.mythIndex ?? 0) + 1} of 4</p>
        <p className="text-2xl font-serif font-light leading-relaxed text-[#1C1C1C] max-w-xs">
          &ldquo;{myth?.statement}&rdquo;
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!voted ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <button
              onClick={() => vote('MYTH')}
              className="w-full h-20 bg-white border border-[#D4CFC8] text-[#8B4A34] text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 hover:border-[#1C1C1C] hover:bg-[#F9F8F6] shadow-sm"
            >
              Myth
            </button>
            <button
              onClick={() => vote('FACT')}
              className="w-full h-20 bg-white border border-[#D4CFC8] text-[#7A8B76] text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 hover:border-[#1C1C1C] hover:bg-[#F9F8F6] shadow-sm"
            >
              Fact
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="voted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="text-center space-y-4"
          >
            <p className={`text-[10px] uppercase tracking-[0.2em] ${voted === 'MYTH' ? 'text-[#8B4A34]' : 'text-[#7A8B76]'}`}>
              {voted} recorded
            </p>
            <p className="text-[#1C1C1C] font-serif text-lg">Awaiting reveal</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
