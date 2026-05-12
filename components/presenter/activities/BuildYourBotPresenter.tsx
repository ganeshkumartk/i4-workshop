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
    <div className="flex flex-col h-full px-8 py-8 relative font-mono uppercase">
      <div className="flex items-center justify-between mb-8 border-b-4 border-black dark:border-white pb-4">
        <h3 className="text-xl font-black tracking-tighter">ROBOT.ASSEMBLY</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold bg-[#FF0000] text-white px-4 py-1 border-2 border-black dark:border-white">
            {bots.length} / {participantCount}
          </span>
          {bots.length > 0 && (
            <button
              onClick={runTeam}
              className="px-6 py-2 border-4 border-black bg-[#BEF264] text-black font-black text-sm hover:bg-black hover:text-[#BEF264] hover:border-[#BEF264] transition-none"
            >
              RUN.TEAM
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {bots.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-4 border-dashed border-black/30 dark:border-white/30 text-2xl font-bold opacity-50">
            [ WAITING_FOR_ASSEMBLY ]
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 items-end">
            <AnimatePresence>
              {bots.map((bot, i) => {
                const bodyDef = BOT_BODIES.find(b => b.id === bot.body);
                const powerDef = BOT_SUPERPOWERS.find(p => p.id === bot.superpower);
                return (
                  <motion.div
                    key={bot.botName}
                    initial={{ opacity: 0, y: 50 }}
                    animate={running ? {
                      x: [0, Math.random() * 20 - 10, 0],
                      y: [0, -20, 0],
                      rotate: [0, Math.random() * 10 - 5, 0]
                    } : { opacity: 1, y: 0, x: 0, rotate: 0 }}
                    transition={running 
                      ? { duration: 0.3, repeat: Infinity, delay: i * 0.1 } 
                      : { type: 'spring', stiffness: 200, delay: 0.05 }
                    }
                    className="border-4 border-black dark:border-white bg-white dark:bg-black p-4 w-40 flex flex-col items-center gap-4 text-center shadow-[8px_8px_0px_rgba(0,255,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,255,0,1)] transition-all"
                  >
                    <div className="relative bg-black/5 dark:bg-white/5 w-full aspect-square flex items-center justify-center border-2 border-black dark:border-white">
                      <span className="text-6xl">{bodyDef?.emoji}</span>
                      <motion.span
                        className="absolute -bottom-3 -right-3 text-3xl bg-white dark:bg-black rounded-full border-2 border-black dark:border-white p-1"
                        animate={running ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.2, delay: i * 0.05, repeat: running ? Infinity : 0 }}
                      >
                        {powerDef?.emoji}
                      </motion.span>
                    </div>
                    <div className="w-full">
                      <p className="bg-black text-white dark:bg-white dark:text-black font-black text-sm py-1 px-2 border-2 border-black dark:border-white w-full truncate" title={bot.botName}>
                        {bot.botName}
                      </p>
                      {bot.participantName && (
                        <p className="text-xs font-bold mt-2 truncate">BY: {bot.participantName}</p>
                      )}
                    </div>
                    <p className="text-[10px] font-bold tracking-widest opacity-80 border-t-2 border-black dark:border-white w-full pt-2">{bot.job}</p>
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
