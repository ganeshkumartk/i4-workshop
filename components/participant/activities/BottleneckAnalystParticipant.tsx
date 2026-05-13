'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';
import { BOTTLENECK_SCENARIOS } from '@/lib/data';

interface Props {
  config?: { scenarioId?: string };
}

export default function BottleneckAnalystParticipant({ config }: Props) {
  const emit = useEmit();
  const [intervention, setIntervention] = useState('');
  const [justification, setJustification] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const scenario = BOTTLENECK_SCENARIOS.find(s => s.id === config?.scenarioId) || BOTTLENECK_SCENARIOS[0];
  const valid = intervention && justification.trim().length > 5;

  function submit() {
    if (!valid || submitted) return;
    setSubmitted(true);
    emit('submit_response', {
      activityId: 'bottleneck',
      data: { intervention, justification: justification.trim() },
    });
  }

  const selectedIntervention = scenario.interventions.find(i => i.id === intervention);

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto bg-[#F9F8F6] font-sans pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="space-y-6 sm:space-y-8 max-w-[500px] mx-auto w-full pb-4">
            <div className="text-center space-y-2">
              <p className="text-[#1C1C1C] font-serif text-xl sm:text-2xl font-medium tracking-tight">System Diagnosis</p>
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em]">Select I4.0 Intervention</p>
            </div>

            <div className="bg-white border border-[#D4CFC8] p-4 sm:p-5 shadow-sm space-y-2">
              <p className="text-[#8B7D56] font-bold text-[10px] uppercase tracking-[0.2em]">{scenario.title}</p>
              <p className="text-[#1C1C1C] text-sm sm:text-base leading-relaxed">{scenario.description}</p>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 sm:mb-3">Select Intervention</p>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {scenario.interventions.map(i => (
                    <button
                      key={i.id}
                      onClick={() => setIntervention(i.id)}
                      className={`flex items-center gap-4 p-3 sm:p-4 border transition-all duration-300 text-left ${
                        intervention === i.id ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-md' : 'border-[#D4CFC8] bg-white hover:border-[#1C1C1C] hover:bg-[#F9F8F6] text-[#1C1C1C] shadow-sm'
                      }`}
                    >
                      <span className={`text-2xl sm:text-3xl transition-all duration-500 shrink-0 ${intervention === i.id ? 'scale-110' : 'grayscale opacity-90'}`}>{i.emoji}</span>
                      <div className="flex flex-col">
                        <span className={`text-xs sm:text-sm font-bold uppercase tracking-[0.1em] ${intervention === i.id ? 'text-white' : 'text-[#1C1C1C]'}`}>{i.label}</span>
                        <span className={`text-[10px] sm:text-xs mt-0.5 ${intervention === i.id ? 'text-[#D4CFC8]' : 'text-[#6B6560]'}`}>{i.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 sm:mb-3">Rationale</p>
                <textarea
                  maxLength={100}
                  rows={3}
                  placeholder="Why this approach?"
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  className="w-full bg-white border border-[#D4CFC8] px-4 py-3 sm:py-4 text-[#1C1C1C] font-medium text-sm sm:text-base focus:outline-none focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm rounded-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full py-4 sm:py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 mt-4"
              style={{ background: valid ? '#1C1C1C' : '#D4CFC8', color: valid ? '#FFFFFF' : '#6B6560' }}
            >
              Submit Diagnosis
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col items-center justify-center h-full gap-6 sm:gap-8 text-center max-w-[400px] mx-auto"
          >
            <div className="bg-white border border-[#D4CFC8] p-6 sm:p-8 w-full shadow-sm">
              <span className="text-5xl sm:text-6xl grayscale opacity-80 block mb-4">{selectedIntervention?.emoji}</span>
              <p className="text-[#1C1C1C] font-bold text-sm sm:text-base uppercase tracking-[0.1em] mb-2">{selectedIntervention?.label}</p>
              <p className="text-[#6B6560] text-xs sm:text-sm italic border-t border-[#E8E4DF] pt-3 mt-3">"{justification}"</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[#8B7D56] font-bold text-[10px] uppercase tracking-[0.2em]">Diagnosis Submitted</p>
            </div>
            <p className="text-[#1C1C1C] font-serif text-lg sm:text-xl font-medium mt-2">Watch the main screen for results</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}