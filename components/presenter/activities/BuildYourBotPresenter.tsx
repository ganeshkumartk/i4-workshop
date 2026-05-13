'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOT_BODIES, BOT_SUPERPOWERS } from '@/lib/data';

interface Bot {
  body: string;
  superpower: string;
  job: string;
  botName: string;
  participantName?: string;
}

interface Props { 
  participantCount: number;
  responses?: Record<string, any>;
}

export default function BuildYourBotPresenter({ participantCount, responses = {} }: Props) {
  const bots = Object.values(responses) as Bot[];
  const [running, setRunning] = useState(false);

  function runTeam() {
    setRunning(true);
    setTimeout(() => setRunning(false), 3000);
  }

  return (
    <div className="flex flex-col h-full px-12 py-12 relative font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-[#E8E4DF] pb-4">
        <h3 className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">Team Roster</h3>
        <div className="flex items-center gap-6">
          <span className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">{bots.length} / {participantCount} deployed</span>
          {bots.length > 0 && (
            <button
              onClick={runTeam}
              className="px-6 py-2.5 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#2A2A2A]"
            >
              Initialize Sequence
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {bots.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[#8D8881] text-xs font-serif italic tracking-wide">
            Awaiting assembly...
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 content-start">
            <AnimatePresence>
              {bots.map((bot, i) => {
                const bodyDef = BOT_BODIES.find(b => b.id === bot.body);
                const powerDef = BOT_SUPERPOWERS.find(p => p.id === bot.superpower);
                return (
                  <motion.div
                    key={bot.botName}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: running ? [1, 1.02, 1] : 1,
                      y: 0,
                    }}
                    transition={running
                      ? { scale: { duration: 0.8, delay: i * 0.1, repeat: 3, repeatType: 'reverse', ease: [0.25, 0.1, 0.25, 1.0] } }
                      : { duration: 0.8, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1.0] }
                    }
                    className="bg-[#FFFFFF] border border-[#E8E4DF] p-6 w-48 flex flex-col items-center gap-4 text-center transition-all duration-500 hover:border-[#D4CFC8] hover:shadow-md"
                    style={running ? { borderColor: powerDef ? '#8B7D56' : '#E8E4DF' } : {}}
                  >
                    <div className="relative pt-2">
                      <span className="text-5xl grayscale opacity-80">{bodyDef?.emoji}</span>
                      <motion.span
                        className="absolute -bottom-2 -right-2 text-2xl"
                        animate={running ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.6, delay: i * 0.1 + 0.2, repeat: running ? 3 : 0 }}
                      >
                        {powerDef?.emoji}
                      </motion.span>
                    </div>
                    <div className="pt-4 border-t border-[#E8E4DF] w-full mt-2">
                      <p className="text-[#1C1C1C] font-serif text-lg leading-tight">{bot.botName}</p>
                      {bot.participantName && (
                        <p className="text-[#8D8881] text-[10px] uppercase tracking-[0.15em] mt-1">By {bot.participantName}</p>
                      )}
                    </div>
                    <p className="text-[#6B6560] text-[11px] leading-relaxed mt-2">{bot.job}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
