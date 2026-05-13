'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';
import { DESIGN_OBJECTS } from '@/lib/data';

interface Props {
  assignment?: { id: string; label: string; emoji: string };
  socketId?: string;
  assignments?: Record<string, { id: string; label: string; emoji: string }>;
}

const LAYERS = [
  { key: 'sense',   label: 'Sense',   desc: 'What does it measure?',     color: '#8B7D56' },
  { key: 'report',  label: 'Report',  desc: 'Who gets the signal?',       color: '#4A5B69' },
  { key: 'decide',  label: 'Decide',  desc: 'What changes as a result?',  color: '#7A8B76' },
  { key: 'deliver', label: 'Deliver', desc: 'What value did you unlock?', color: '#8B4A34' },
];

export default function DesignCardParticipant({ assignments, socketId }: Props) {
  const emit = useEmit();
  const assignment = socketId && assignments ? assignments[socketId] : DESIGN_OBJECTS[0];
  const [fields, setFields] = useState({ sense: '', report: '', decide: '', deliver: '', name: '' });
  const [submitted, setSubmitted] = useState(false);

  const valid = LAYERS.every(l => fields[l.key as keyof typeof fields].trim().length > 0);

  function submit() {
    if (!valid || submitted) return;
    setSubmitted(true);
    emit('submit_response', {
      activityId: 'designCard',
      data: { object: assignment, ...fields },
    });
  }

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto bg-[#F9F8F6] font-sans pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 max-w-[500px] mx-auto w-full pb-4"
          >
            <div className="text-center py-2 space-y-2">
              <span className="text-3xl sm:text-4xl grayscale opacity-80">{assignment?.emoji}</span>
              <p className="text-[#1C1C1C] font-serif text-xl sm:text-2xl font-medium tracking-tight">{assignment?.label}</p>
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em]">Complete the layers</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {LAYERS.map(layer => (
                <div key={layer.key}>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold mb-2" style={{ color: layer.color }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: layer.color }} />
                    <span className="shrink-0">{layer.label}</span>
                    <span className="text-[#6B6560] font-medium lowercase tracking-normal truncate">— {layer.desc}</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={`e.g. ${layer.key === 'sense' ? 'temperature' : layer.key === 'report' ? 'your phone' : layer.key === 'decide' ? 'sends alert' : 'prevent spoilage'}`}
                    value={fields[layer.key as keyof typeof fields]}
                    onChange={e => setFields(f => ({ ...f, [layer.key]: e.target.value }))}
                    className="w-full bg-white border border-[#D4CFC8] px-4 py-3 sm:py-4 text-[#1C1C1C] font-medium text-sm sm:text-base focus:outline-none focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm rounded-none"
                  />
                </div>
              ))}

              <div className="pt-2">
                <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 block">Product name (optional)</label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. SmartKey Pro"
                  value={fields.name}
                  onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white border border-[#D4CFC8] px-4 py-3 sm:py-4 text-[#1C1C1C] font-medium text-sm sm:text-base focus:outline-none focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm rounded-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full py-4 sm:py-5 mt-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50"
              style={{ background: valid ? '#1C1C1C' : '#D4CFC8', color: valid ? '#FFFFFF' : '#6B6560' }}
            >
              Submit Design
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col items-center justify-center h-full gap-6 sm:gap-8 text-center max-w-[400px] mx-auto w-full"
          >
            <p className="text-[#8B7D56] font-bold text-[10px] uppercase tracking-[0.2em]">Design Submitted</p>
            <div className="bg-white border border-[#D4CFC8] p-5 sm:p-6 w-full text-left space-y-4 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-[#E8E4DF]">
                <span className="text-2xl sm:text-3xl grayscale opacity-80">{assignment?.emoji}</span>
                <span className="font-serif text-base sm:text-lg font-medium text-[#1C1C1C] leading-tight">{fields.name || `Smart ${assignment?.label}`}</span>
              </div>
              {LAYERS.map(l => (
                <div key={l.key} className="flex gap-3 sm:gap-4 items-start">
                  <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.1em] w-14 sm:w-16 shrink-0 mt-1 sm:mt-0.5" style={{ color: l.color }}>{l.label}</span>
                  <span className="text-[#1C1C1C] text-sm sm:text-base font-medium">{fields[l.key as keyof typeof fields]}</span>
                </div>
              ))}
            </div>
            <p className="text-[#1C1C1C] font-serif text-lg sm:text-xl font-medium mt-2">Watch the exhibition</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
