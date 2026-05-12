'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  object: { id: string; label: string; emoji: string };
  sense: string;
  report: string;
  decide: string;
  deliver: string;
  name: string;
  participantName?: string;
}

const LAYER_COLORS: Record<string, string> = {
  sense:   '#3B82F6',
  report:  '#8B5CF6',
  decide:  '#F59E0B',
  deliver: '#16A34A',
};

interface Props { 
  participantCount: number;
  responses?: Record<string, any>;
}

export default function DesignCardPresenter({ participantCount, responses = {} }: Props) {
  const cards = Object.values(responses) as Card[];
  const [spotlight, setSpotlight] = useState<Card | null>(null);

  return (
    <div className="flex flex-col h-full px-8 py-8 relative font-mono uppercase">
      <div className="flex items-center justify-between mb-8 border-b-4 border-black dark:border-white pb-4">
        <h3 className="text-xl font-black tracking-tighter">DESIGN.CARDS</h3>
        <span className="text-sm font-bold bg-[#0000FF] text-white px-4 py-1 border-2 border-black dark:border-white">
          {cards.length} / {participantCount}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-wrap gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="cursor-pointer border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_rgba(255,0,0,1)] hover:shadow-[12px_12px_0px_rgba(255,0,0,1)] hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setSpotlight(card)}
            >
              <DesignCard card={card} />
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-64 border-4 border-dashed border-black/30 dark:border-white/30 text-2xl font-bold opacity-50">
            [ WAITING_FOR_DATA ]
          </div>
        )}
      </div>

      {/* Spotlight overlay */}
      <AnimatePresence>
        {spotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#BEF264] flex items-center justify-center z-50 p-8"
            onClick={() => setSpotlight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl border-8 border-black bg-white shadow-[24px_24px_0px_rgba(0,0,0,1)] text-black"
            >
              <DesignCard card={spotlight} large />
              <div className="bg-black text-white p-2 text-center text-xs font-bold tracking-widest cursor-pointer hover:bg-[#FF0000]">
                [ CLICK_TO_CLOSE ]
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignCard({ card, large }: { card: Card; large?: boolean }) {
  const size = large ? 'p-8' : 'p-4';
  const emojiSize = large ? 'text-6xl' : 'text-3xl';
  const titleSize = large ? 'text-4xl' : 'text-lg';
  const bodySize = large ? 'text-xl' : 'text-xs';

  return (
    <div className={`flex flex-col ${size} ${large ? 'w-full' : 'w-64'} space-y-6`}>
      <div className="flex items-center gap-4 border-b-4 border-black pb-4">
        <span className={emojiSize}>{card.object?.emoji}</span>
        <div>
          <p className={`font-black tracking-tighter leading-none ${titleSize} text-black dark:text-white`}>
            {card.name || `SMART_${card.object?.label}`}
          </p>
          {card.participantName && (
            <p className="text-black dark:text-white bg-[#BEF264] dark:bg-[#0000FF] px-2 py-1 text-xs font-bold w-fit mt-2 border-2 border-black dark:border-white">
              NODE: {card.participantName}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {(['sense', 'report', 'decide', 'deliver'] as const).map(key => (
          <div key={key} className="flex gap-4 items-start">
            <span
              className={`font-black w-24 shrink-0 uppercase border-2 border-black dark:border-white px-2 py-1 text-center bg-black text-white dark:bg-white dark:text-black ${bodySize}`}
            >
              {key}
            </span>
            <span className={`font-bold text-black dark:text-white ${bodySize}`}>{card[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
