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
    <div className="flex flex-col h-full px-6 py-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="opacity-50 text-sm uppercase tracking-widest font-medium">Design Cards</h3>
        <span className="opacity-40 text-sm font-medium">{cards.length} / {participantCount} submitted</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-wrap gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="fly-in cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setSpotlight(card)}
              whileHover={{ scale: 1.03 }}
            >
              <DesignCard card={card} />
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-48 opacity-30 text-sm font-medium">
            Cards will appear here as participants submit...
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
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8"
            onClick={() => setSpotlight(null)}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md shadow-2xl"
            >
              <DesignCard card={spotlight} large />
              <p className="text-center text-white/50 text-xs mt-3 font-medium drop-shadow-md">Click anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignCard({ card, large }: { card: Card; large?: boolean }) {
  const size = large ? 'p-6' : 'p-4';
  const emojiSize = large ? 'text-4xl' : 'text-2xl';
  const titleSize = large ? 'text-xl' : 'text-sm';
  const bodySize = large ? 'text-base' : 'text-xs';

  return (
    <div className={`bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl ${size} ${large ? 'w-full' : 'w-52'} space-y-3 shadow-lg`}>
      <div className="flex items-center gap-3">
        <span className={emojiSize}>{card.object?.emoji}</span>
        <div>
          <p className={`font-bold ${titleSize}`}>
            {card.name || `Smart ${card.object?.label}`}
          </p>
          {card.participantName && (
            <p className="opacity-40 text-xs font-medium">{card.participantName}</p>
          )}
        </div>
      </div>
      {(['sense', 'report', 'decide', 'deliver'] as const).map(key => (
        <div key={key} className="flex gap-3 items-start">
          <span
            className={`font-bold w-14 shrink-0 capitalize ${bodySize}`}
            style={{ color: LAYER_COLORS[key] }}
          >
            {key}
          </span>
          <span className={`opacity-80 font-medium ${bodySize}`}>{card[key]}</span>
        </div>
      ))}
    </div>
  );
}
