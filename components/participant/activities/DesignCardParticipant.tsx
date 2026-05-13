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
    <div className="flex flex-col h-full px-6 py-8 overflow-y-auto bg-[#F9F8F6] font-sans">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="text-center py-2 space-y-2">
              <span className="text-4xl grayscale opacity-80">{assignment?.emoji}</span>
              <p className="text-[#1C1C1C] font-serif text-xl tracking-tight">{assignment?.label}</p>
              <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">Complete the layers</p>
            </div>

            <div className="space-y-5">
              {LAYERS.map(layer => (
                <div key={layer.key}>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-medium mb-2" style={{ color: layer.color }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: layer.color }} />
                    {layer.label}
                    <span className="text-[#8D8881] font-normal lowercase tracking-normal">— {layer.desc}</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={`e.g. ${layer.key === 'sense' ? 'temperature' : layer.key === 'report' ? 'your phone' : layer.key === 'decide' ? 'sends alert' : 'prevent spoilage'}`}
                    value={fields[layer.key as keyof typeof fields]}
                    onChange={e => setFields(f => ({ ...f, [layer.key]: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E8E4DF] px-4 py-3 text-[#1C1C1C] text-sm focus:outline-none focus:border-[#8B7D56] transition-colors placeholder:text-[#D4CFC8]"
                  />
                </div>
              ))}

              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] font-medium text-[#6B6560] mb-2 block">Product name (optional)</label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="e.g. SmartKey Pro"
                  value={fields.name}
                  onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E8E4DF] px-4 py-3 text-[#1C1C1C] text-sm focus:outline-none focus:border-[#8B7D56] transition-colors placeholder:text-[#D4CFC8]"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full py-4 mt-4 text-xs tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-30 disabled:bg-[#E8E4DF] disabled:text-[#8D8881]"
              style={{ background: valid ? '#1C1C1C' : '#E8E4DF', color: valid ? '#FFFFFF' : '#8D8881' }}
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
            className="flex flex-col items-center justify-center h-full gap-8 text-center"
          >
            <p className="text-[#8B7D56] text-[10px] uppercase tracking-[0.2em]">Design Submitted</p>
            <div className="bg-[#FFFFFF] border border-[#E8E4DF] p-6 w-full text-left space-y-4 shadow-sm">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E8E4DF]">
                <span className="text-3xl grayscale opacity-80">{assignment?.emoji}</span>
                <span className="font-serif text-lg text-[#1C1C1C] leading-tight">{fields.name || `Smart ${assignment?.label}`}</span>
              </div>
              {LAYERS.map(l => (
                <div key={l.key} className="flex gap-4 items-start">
                  <span className="font-medium text-[10px] uppercase tracking-[0.1em] w-16 shrink-0 mt-0.5" style={{ color: l.color }}>{l.label}</span>
                  <span className="text-[#6B6560] text-sm">{fields[l.key as keyof typeof fields]}</span>
                </div>
              ))}
            </div>
            <p className="text-[#1C1C1C] font-serif text-lg">Watch the exhibition</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
