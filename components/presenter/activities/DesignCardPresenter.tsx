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
    <div className="flex flex-col h-full px-12 py-12 relative font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-[#E8E4DF] pb-4">
        <h3 className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">Exhibition</h3>
        <span className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">{cards.length} / {participantCount} objects</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-wrap gap-8 content-start">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
              onClick={() => setSpotlight(card)}
            >
              <DesignCard card={card} />
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-64 text-[#8D8881] text-xs font-serif italic tracking-wide">
            Awaiting submissions...
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
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[#F9F8F6]/95 backdrop-blur-md flex items-center justify-center z-50 p-12"
            onClick={() => setSpotlight(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <DesignCard card={spotlight} large />
              <p className="text-center text-[#8D8881] text-[10px] uppercase tracking-[0.2em] mt-12 cursor-pointer hover:text-[#1C1C1C] transition-colors" onClick={() => setSpotlight(null)}>
                Close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignCard({ card, large }: { card: Card; large?: boolean }) {
  const size = large ? 'p-12' : 'p-6';
  const emojiSize = large ? 'text-5xl' : 'text-3xl';
  const titleSize = large ? 'text-2xl' : 'text-base';
  const bodySize = large ? 'text-sm' : 'text-[11px]';

  // Map vibrant layer colors to muted atelier ones
  const ATELIER_COLORS: Record<string, string> = {
    sense: '#8B7D56',   // brass
    report: '#4A5B69',  // slate
    decide: '#7A8B76',  // sage
    deliver: '#8B4A34', // rust
  };

  const LABELS: Record<string, string> = {
    sense: 'Sensor',
    report: 'Network',
    decide: 'Compute',
    deliver: 'Value',
  };

  return (
    <div className={`bg-[#FFFFFF] border border-[#E8E4DF] ${size} ${large ? 'w-full shadow-2xl shadow-black/5' : 'w-64 hover:border-[#D4CFC8] hover:shadow-md transition-all duration-500'} space-y-6 relative overflow-hidden group`}>
      <div className="flex items-start gap-4">
        <span className={`${emojiSize} grayscale group-hover:grayscale-0 transition-all duration-700`}>{card.object?.emoji}</span>
        <div className="pt-1">
          <p className={`font-serif text-[#1C1C1C] leading-tight ${titleSize}`}>
            {card.name || `Smart ${card.object?.label}`}
          </p>
          {card.participantName && (
            <p className="text-[#8D8881] text-[10px] uppercase tracking-[0.15em] mt-2">
              By {card.participantName}
            </p>
          )}
        </div>
      </div>
      <div className={`${large ? 'space-y-4 pt-4 border-t border-[#E8E4DF]' : 'space-y-3 pt-2'} `}>
        {(['sense', 'report', 'decide', 'deliver'] as const).map(key => (
          <div key={key} className="flex gap-4 items-start">
            <span
              className={`font-medium w-16 shrink-0 uppercase ${bodySize} tracking-widest`}
              style={{ color: ATELIER_COLORS[key] }}
            >
              {LABELS[key]}
            </span>
            <span className={`text-[#6B6560] leading-relaxed ${bodySize}`}>{card[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
