'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';
import { BOT_BODIES, BOT_SUPERPOWERS } from '@/lib/data';

export default function BuildYourBotParticipant() {
  const emit = useEmit();
  const [body, setBody] = useState('');
  const [superpower, setSuperpower] = useState('');
  const [job, setJob] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [botName, setBotName] = useState('');

  const valid = body && superpower && job.trim().length > 2;

  function submit() {
    if (!valid || submitted) return;
    setSubmitted(true);
    emit('submit_response', {
      activityId: 'buildYourBot',
      data: { body, superpower, job: job.trim() },
    });
  }

  const selectedBody = BOT_BODIES.find(b => b.id === body);
  const selectedPower = BOT_SUPERPOWERS.find(p => p.id === superpower);

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto bg-[#F9F8F6] font-sans pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="space-y-6 sm:space-y-8 max-w-[500px] mx-auto w-full pb-4">
            <div className="text-center space-y-2">
              <p className="text-[#1C1C1C] font-serif text-xl sm:text-2xl font-medium tracking-tight">Robot Assembly</p>
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em]">Configure 3 parameters to deploy</p>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {/* Body */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 sm:mb-3">Core chassis</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {BOT_BODIES.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBody(b.id)}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border transition-all duration-300 min-h-[80px] sm:min-h-[100px] ${
                        body === b.id ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-md' : 'border-[#D4CFC8] bg-white hover:border-[#1C1C1C] hover:bg-[#F9F8F6] text-[#1C1C1C] shadow-sm'
                      }`}
                    >
                      <span className={`text-2xl sm:text-3xl transition-all duration-500 ${body === b.id ? 'scale-110' : 'grayscale opacity-90'}`}>{b.emoji}</span>
                      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] text-center leading-tight ${body === b.id ? 'text-white' : 'text-[#1C1C1C]'}`}>{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Superpower */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 sm:mb-3">Sensory array</p>
                <div className="grid grid-cols-4 gap-2">
                  {BOT_SUPERPOWERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSuperpower(p.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-3 border transition-all duration-300 min-h-[70px] sm:min-h-[90px] ${
                        superpower === p.id ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-md' : 'border-[#D4CFC8] bg-white hover:border-[#1C1C1C] hover:bg-[#F9F8F6] text-[#1C1C1C] shadow-sm'
                      }`}
                    >
                      <span className={`text-xl sm:text-2xl transition-all duration-500 ${superpower === p.id ? 'scale-110' : 'grayscale opacity-90'}`}>{p.emoji}</span>
                      <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.1em] text-center leading-tight ${superpower === p.id ? 'text-white' : 'text-[#1C1C1C]'}`}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Job */}
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#1C1C1C] mb-2 sm:mb-3">Primary directive</p>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. measure machine temp"
                  value={job}
                  onChange={e => setJob(e.target.value)}
                  className="w-full bg-white border border-[#D4CFC8] px-4 py-3 sm:py-4 text-[#1C1C1C] font-medium text-sm sm:text-base focus:outline-none focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C] transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm rounded-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full py-4 sm:py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 mt-4"
              style={{ background: valid ? '#1C1C1C' : '#D4CFC8', color: valid ? '#FFFFFF' : '#6B6560' }}
            >
              Deploy
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col items-center justify-center h-full gap-6 sm:gap-8 text-center"
          >
            <div className="relative p-6 sm:p-8 bg-white border border-[#D4CFC8] shadow-sm">
              <span className="text-6xl sm:text-7xl grayscale opacity-80">{selectedBody?.emoji}</span>
              <span className="absolute -bottom-2 -right-2 text-3xl sm:text-4xl grayscale opacity-90">{selectedPower?.emoji}</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[#8B7D56] font-bold text-[10px] uppercase tracking-[0.2em]">Deployment successful</p>
              <p className="text-[#1C1C1C] font-serif text-lg sm:text-xl font-medium max-w-[240px] leading-snug mx-auto">{job}</p>
            </div>
            <p className="text-[#6B6560] font-medium text-[10px] uppercase tracking-[0.2em] mt-2">Joining team roster on screen</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
