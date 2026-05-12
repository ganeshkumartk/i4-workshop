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
    <div className="flex flex-col items-center justify-center h-full px-8 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="text-5xl mb-4">⚙️</div>
        <h1 className="text-2xl font-bold text-white">Industry 4.0</h1>
        <p className="text-white/40 text-sm">D-CoE · IISc Workshop</p>
        {participantCount > 0 && (
          <p className="text-[#BEF264] text-xs mt-2">{participantCount} people already in the room</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-xs space-y-4"
      >
        <input
          type="text"
          placeholder="Your name"
          maxLength={30}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          autoFocus
          className="w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-[#16A34A] text-center transition-colors"
        />
        <button
          onClick={join}
          disabled={!name.trim()}
          className="w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-30"
          style={{
            background: name.trim() ? '#16A34A' : '#2a2a2a',
            color: 'white',
          }}
        >
          Join the workshop →
        </button>
      </motion.div>

      <p className="text-white/20 text-xs text-center">Scan the QR code on the projector screen to join</p>
    </div>
  );
}
