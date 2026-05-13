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
  { 
    key: 'sense',   
    label: 'Sensor Array',   
    desc: 'What physical property is being measured?',     
    color: '#8B7D56',
    suggestions: ['Thermal (Heat)', 'Optical (Vision)', 'Acoustic (Sound)', 'Kinematic (Motion)', 'RFID (Presence)']
  },
  { 
    key: 'report',  
    label: 'Connectivity',  
    desc: 'How does it transmit data?',       
    color: '#4A5B69',
    suggestions: ['5G / Cellular', 'LoRaWAN', 'Wi-Fi', 'Bluetooth Low Energy', 'Industrial Ethernet']
  },
  { 
    key: 'decide',  
    label: 'Intelligence',  
    desc: 'Where is the data processed?',  
    color: '#7A8B76',
    suggestions: ['Cloud AI Analytics', 'Edge Computing', 'Local Microcontroller', 'Rule-based Logic']
  },
  { 
    key: 'deliver', 
    label: 'Value Output', 
    desc: 'What is the business outcome?', 
    color: '#8B4A34',
    suggestions: ['Predictive Maintenance', 'Automated QA', 'Energy Optimization', 'Safety & Compliance']
  },
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
              <p className="text-[#1C1C1C] font-serif text-xl sm:text-2xl font-medium tracking-tight">Smart {assignment?.label}</p>
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em]">Cyber-Physical Blueprint</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {LAYERS.map(layer => (
                <div key={layer.key} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: layer.color }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: layer.color }} />
                      <span className="shrink-0">{layer.label}</span>
                    </label>
                    <span className="text-[#6B6560] text-xs font-medium pl-3.5 border-l border-[#E8E4DF] ml-0.5">{layer.desc}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pl-3.5 ml-0.5">
                    {layer.suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          const current = fields[layer.key as keyof typeof fields];
                          // If they click the suggestion, replace or append
                          const newVal = current.includes(s) ? current.replace(s, '').replace(/^ - | - $/g, '').trim() : s;
                          setFields(f => ({ ...f, [layer.key]: newVal }));
                        }}
                        className={`text-[9px] uppercase tracking-[0.1em] px-2.5 py-1.5 border transition-all ${
                          fields[layer.key as keyof typeof fields].includes(s)
                            ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                            : 'bg-white text-[#6B6560] border-[#D4CFC8] hover:border-[#1C1C1C] hover:text-[#1C1C1C]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="pl-3.5 ml-0.5">
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="Specific application / details..."
                      value={fields[layer.key as keyof typeof fields]}
                      onChange={e => setFields(f => ({ ...f, [layer.key]: e.target.value }))}
                      className="w-full bg-white border border-[#D4CFC8] px-4 py-3 sm:py-4 text-[#1C1C1C] font-medium text-sm sm:text-base focus:outline-none focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm rounded-none"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#E8E4DF]">
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
              Submit Blueprint
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
