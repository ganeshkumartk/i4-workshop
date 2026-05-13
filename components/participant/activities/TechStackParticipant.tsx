'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';
import { TECHNOLOGIES, STACK_SCENARIOS } from '@/lib/data';

interface Props {
  config: { scenarioId?: string };
}

export default function TechStackParticipant({ config }: Props) {
  const emit = useEmit();
  const scenario = STACK_SCENARIOS.find(s => s.id === config?.scenarioId) || STACK_SCENARIOS[0];
  const [picks, setPicks] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggle(id: string) {
    if (submitted) return;
    setPicks(p =>
      p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p
    );
  }

  function submit() {
    if (picks.length !== 3 || submitted) return;
    setSubmitted(true);
    emit('submit_response', {
      activityId: 'techStack',
      data: { picks },
    });
  }

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto bg-[#F9F8F6] font-sans">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="space-y-6 sm:space-y-8 pb-4">
            <div className="text-center space-y-2 sm:space-y-3">
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em]">Your challenge</p>
              <p className="text-base sm:text-lg font-serif font-medium text-[#1C1C1C] leading-snug">{scenario.text}</p>
              <p className="text-[#1C1C1C] text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                Pick <span className="text-[#1C1C1C] font-bold">3</span> technologies
                <span className="ml-2 text-[#8B7D56] font-medium">{picks.length}/3 selected</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-[400px] mx-auto">
              {TECHNOLOGIES.map(tech => {
                const selected = picks.includes(tech.id);
                const maxed = picks.length >= 3 && !selected;
                return (
                  <button
                    key={tech.id}
                    onClick={() => toggle(tech.id)}
                    disabled={maxed}
                    className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border transition-all duration-300 min-h-[90px] sm:min-h-[110px] ${
                      selected
                        ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-md'
                        : maxed
                        ? 'border-[#D4CFC8] bg-transparent opacity-40'
                        : 'border-[#D4CFC8] bg-white hover:border-[#1C1C1C] hover:bg-[#F9F8F6] text-[#1C1C1C] shadow-sm'
                    }`}
                  >
                    <span className={`text-xl sm:text-2xl transition-all duration-500 ${selected ? 'scale-110' : 'grayscale opacity-90'}`}>{tech.emoji}</span>
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widesttext-center leading-tight ${selected ? 'text-white' : 'text-[#1C1C1C]'}`}>{tech.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={submit}
              disabled={picks.length !== 3}
              className="w-full max-w-[400px] mx-auto block py-4 sm:py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 mt-4"
              style={{ background: picks.length === 3 ? '#1C1C1C' : '#D4CFC8', color: picks.length === 3 ? '#FFFFFF' : '#6B6560' }}
            >
              Lock Selection
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col items-center justify-center h-full gap-8"
          >
            <p className="text-[#8B7D56] font-bold text-[10px] uppercase tracking-[0.2em]">Selection Confirmed</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {picks.map((id, i) => {
                const t = TECHNOLOGIES.find(t => t.id === id)!;
                return (
                  <motion.div 
                    key={id} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="flex flex-col items-center gap-2 sm:gap-3 bg-white border border-[#D4CFC8] p-3 sm:p-4 w-20 sm:w-24 shadow-sm"
                  >
                    <span className="text-2xl sm:text-3xl">{t.emoji}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#1C1C1C] text-center leading-tight">{t.label.split(' ')[0]}</span>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-[#1C1C1C] font-serif text-lg sm:text-xl font-medium mt-4">Watch the constellation form</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
