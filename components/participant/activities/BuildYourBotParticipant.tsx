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
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="text-center">
              <p className="text-white font-bold text-lg">Build your robot! 🤖</p>
              <p className="text-white/40 text-xs mt-1">3 choices and your bot goes live on the big screen</p>
            </div>

            {/* Body */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Body Type</p>
              <div className="grid grid-cols-3 gap-2">
                {BOT_BODIES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBody(b.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      body === b.id ? 'border-[#16A34A] bg-[#16A34A]/10' : 'border-[#2a2a2a]'
                    }`}
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <span className="text-[10px] text-white/60">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Superpower */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Superpower (what it senses)</p>
              <div className="grid grid-cols-4 gap-2">
                {BOT_SUPERPOWERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSuperpower(p.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                      superpower === p.id ? 'border-[#BEF264] bg-[#BEF264]/10' : 'border-[#2a2a2a]'
                    }`}
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-[9px] text-white/50 text-center leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Job */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">This bot&apos;s job is to…</p>
              <input
                type="text"
                maxLength={30}
                placeholder="eg. keep coffee warm forever"
                value={job}
                onChange={e => setJob(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#BEF264] transition-colors"
              />
            </div>

            {/* Preview pill */}
            {body && superpower && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-[#161616] rounded-xl px-4 py-3"
              >
                <span className="text-2xl">{selectedBody?.emoji}</span>
                <span className="text-lg">+</span>
                <span className="text-2xl">{selectedPower?.emoji}</span>
                <span className="text-white/50 text-sm ml-1">{job || '...'}</span>
              </motion.div>
            )}

            <button
              onClick={submit}
              disabled={!valid}
              className="w-full h-14 rounded-2xl font-bold text-lg transition-all disabled:opacity-30"
              style={{ background: valid ? '#BEF264' : '#2a2a2a', color: valid ? '#0B0B0B' : 'white' }}
            >
              Deploy my bot! 🚀
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-5 text-center"
          >
            <div className="relative">
              <span className="text-7xl">{selectedBody?.emoji}</span>
              <span className="absolute -bottom-1 -right-1 text-3xl">{selectedPower?.emoji}</span>
            </div>
            <p className="text-2xl font-bold text-[#BEF264]">Bot deployed!</p>
            <p className="text-white/60 text-sm max-w-[200px]">{job}</p>
            <p className="text-white/30 text-xs">Your bot is joining the team roster on screen!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
