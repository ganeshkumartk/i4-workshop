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
    <div className="flex flex-col h-full px-4 py-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Your challenge</p>
              <p className="text-base font-semibold text-white leading-snug">{scenario.text}</p>
              <p className="text-white/40 text-xs mt-2">
                Pick <span className="text-[#BEF264] font-bold">3 technologies</span> — choose wisely.
                <span className="ml-2 text-white/60">{picks.length}/3 selected</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TECHNOLOGIES.map(tech => {
                const selected = picks.includes(tech.id);
                const maxed = picks.length >= 3 && !selected;
                return (
                  <button
                    key={tech.id}
                    onClick={() => toggle(tech.id)}
                    disabled={maxed}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      selected
                        ? 'border-[#BEF264] bg-[#BEF264]/10'
                        : maxed
                        ? 'border-[#2a2a2a] opacity-30'
                        : 'border-[#2a2a2a] hover:border-white/40'
                    }`}
                  >
                    <span className="text-2xl">{tech.emoji}</span>
                    <span className="text-[10px] text-center leading-tight text-white/70">{tech.label}</span>
                    {selected && <span className="text-[#BEF264] text-xs">✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={submit}
              disabled={picks.length !== 3}
              className="w-full h-14 rounded-2xl font-bold text-lg transition-all disabled:opacity-30"
              style={{ background: picks.length === 3 ? '#BEF264' : '#2a2a2a', color: picks.length === 3 ? '#0B0B0B' : 'white' }}
            >
              Lock in my stack 🔒
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-5"
          >
            <span className="text-5xl">🔗</span>
            <p className="text-xl font-bold text-[#BEF264]">Stack locked in!</p>
            <div className="flex gap-3">
              {picks.map(id => {
                const t = TECHNOLOGIES.find(t => t.id === id)!;
                return (
                  <div key={id} className="flex flex-col items-center gap-1 bg-[#161616] rounded-xl p-3">
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-xs text-white/60 text-center leading-tight">{t.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-white/40 text-sm">Watch the constellation form!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
