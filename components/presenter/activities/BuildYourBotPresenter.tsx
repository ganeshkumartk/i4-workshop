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
    <div className="flex flex-col h-full px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/50 text-sm uppercase tracking-widest">Team Roster</h3>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">{bots.length} / {participantCount} deployed</span>
          {bots.length > 0 && (
            <button
              onClick={runTeam}
              className="px-4 py-2 rounded-xl bg-[#BEF264] text-black font-bold text-sm hover:bg-lime-300 transition-colors"
            >
              Run the team! ⚡
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {bots.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-white/20 text-sm">
            Bots will appear as participants deploy them...
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {bots.map((bot, i) => {
                const bodyDef = BOT_BODIES.find(b => b.id === bot.body);
                const powerDef = BOT_SUPERPOWERS.find(p => p.id === bot.superpower);
                return (
                  <motion.div
                    key={bot.botName}
                    initial={{ opacity: 0, scale: 0.5, y: 30 }}
                    animate={{
                      opacity: 1,
                      scale: running ? [1, 1.1, 1] : 1,
                      y: 0,
                    }}
                    transition={running
                      ? { scale: { duration: 0.4, delay: i * 0.05, repeat: 3, repeatType: 'reverse' } }
                      : { type: 'spring', stiffness: 200, delay: 0.05 }
                    }
                    className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 w-36 flex flex-col items-center gap-2 text-center"
                    style={running ? { borderColor: powerDef ? '#BEF264' : '#2a2a2a' } : {}}
                  >
                    <div className="relative">
                      <span className="text-4xl">{bodyDef?.emoji}</span>
                      <motion.span
                        className="absolute -bottom-1 -right-1 text-lg"
                        animate={running ? { scale: [1, 1.5, 1] } : {}}
                        transition={{ duration: 0.3, delay: i * 0.05 + 0.2, repeat: running ? 3 : 0 }}
                      >
                        {powerDef?.emoji}
                      </motion.span>
                    </div>
                    <div>
                      <p className="text-[#BEF264] font-bold text-sm">{bot.botName}</p>
                      {bot.participantName && (
                        <p className="text-white/30 text-xs">{bot.participantName}</p>
                      )}
                    </div>
                    <p className="text-white/50 text-xs leading-tight">{bot.job}</p>
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
