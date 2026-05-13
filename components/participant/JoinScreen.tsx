'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmit } from '@/hooks/useRealtime';

interface Props {
  onJoined: (name: string) => void;
  participantCount: number;
}

export default function JoinScreen({ onJoined, participantCount }: Props) {
  const emit = useEmit();
  const [name, setName] = useState('');

  function join() {
    const trimmed = name.trim();
    if (!trimmed) return;
    emit('join_session', { name: trimmed });
    onJoined(trimmed);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-12 bg-[#F9F8F6] text-[#1C1C1C] font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="text-center space-y-4"
      >
        <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.3em]">D-CoE · IISc Workshop</p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-[#1C1C1C]">Industry 4.0</h1>
        {participantCount > 0 && (
          <p className="text-[#8B7D56] text-[10px] uppercase tracking-widest mt-4">{participantCount} guests present</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="w-full max-w-xs space-y-6"
      >
        <input
          type="text"
          placeholder="Guest name"
          maxLength={30}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          autoFocus
          className="w-full bg-[#FFFFFF] border border-[#E8E4DF] px-5 py-4 text-[#1C1C1C] text-sm font-sans focus:outline-none focus:border-[#8B7D56] text-center transition-colors placeholder:text-[#8D8881] placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
        />
        <button
          onClick={join}
          disabled={!name.trim()}
          className="w-full py-4 text-xs tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-30 disabled:bg-[#E8E4DF] disabled:text-[#8D8881]"
          style={{
            background: name.trim() ? '#1C1C1C' : '#E8E4DF',
            color: name.trim() ? '#FFFFFF' : '#8D8881',
          }}
        >
          Enter
        </button>
      </motion.div>

      <p className="text-[#8D8881] text-[10px] uppercase tracking-widest text-center absolute bottom-8">Scan the code on the main screen to enter</p>
    </div>
  );
}
