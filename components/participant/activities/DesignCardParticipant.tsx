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
  { key: 'sense',   label: 'Sense',   desc: 'What does it measure?',     color: '#3B82F6' },
  { key: 'report',  label: 'Report',  desc: 'Who gets the signal?',       color: '#8B5CF6' },
  { key: 'decide',  label: 'Decide',  desc: 'What changes as a result?',  color: '#F59E0B' },
  { key: 'deliver', label: 'Deliver', desc: 'What value did you unlock?', color: '#16A34A' },
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
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center py-2">
              <span className="text-5xl">{assignment?.emoji}</span>
              <p className="text-white font-bold text-lg mt-1">{assignment?.label}</p>
              <p className="text-white/40 text-xs">Make it smart — fill in each layer</p>
            </div>

            {LAYERS.map(layer => (
              <div key={layer.key}>
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: layer.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
                  {layer.label}
                  <span className="text-white/30 font-normal">— {layer.desc}</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder={`eg. ${layer.key === 'sense' ? 'temperature' : layer.key === 'report' ? 'your phone' : layer.key === 'decide' ? 'sends alert' : 'prevent spoilage'}`}
                  value={fields[layer.key as keyof typeof fields]}
                  onChange={e => setFields(f => ({ ...f, [layer.key]: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#16A34A] transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-white/40 mb-1.5 block">Product name (optional)</label>
              <input
                type="text"
                maxLength={20}
                placeholder="eg. SmartKey Pro"
                value={fields.name}
                onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#BEF264] transition-colors"
              />
            </div>

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full h-14 rounded-2xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: valid ? '#BEF264' : '#2a2a2a', color: valid ? '#0B0B0B' : 'white' }}
            >
              Launch my card 🚀
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-5 text-center"
          >
            <span className="text-6xl">🎴</span>
            <p className="text-2xl font-bold text-[#BEF264]">Your card is live!</p>
            <div className="bg-[#161616] rounded-2xl p-4 w-full text-left space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{assignment?.emoji}</span>
                <span className="font-semibold">{fields.name || `Smart ${assignment?.label}`}</span>
              </div>
              {LAYERS.map(l => (
                <div key={l.key} className="flex gap-2 text-sm">
                  <span className="font-semibold w-16 shrink-0" style={{ color: l.color }}>{l.label}</span>
                  <span className="text-white/70">{fields[l.key as keyof typeof fields]}</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm">Watch the big screen!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
