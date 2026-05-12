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
    <div className="flex flex-col items-center justify-center h-full px-6 gap-12 font-mono uppercase bg-[#BEF264] text-black">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 w-full"
      >
        <div className="text-6xl mb-4 bg-white border-4 border-black w-24 h-24 mx-auto flex items-center justify-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">!</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">I4.0<br/>WORKSHOP</h1>
        <p className="font-bold border-y-4 border-black py-2 tracking-widest bg-white">D-COE // IISC</p>
        {participantCount > 0 && (
          <p className="text-white bg-black px-3 py-1 font-bold inline-block border-2 border-black mt-4">
            {participantCount} NODES CONNECTED
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm space-y-4"
      >
        <input
          type="text"
          placeholder="ENTER_YOUR_NAME"
          maxLength={30}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          autoFocus
          className="w-full bg-white border-4 border-black px-5 py-4 text-black text-xl font-bold focus:outline-none focus:bg-[#FF0000] focus:text-white placeholder:text-black/30 text-center uppercase"
        />
        <button
          onClick={join}
          disabled={!name.trim()}
          className="w-full py-4 border-4 border-black font-black text-xl hover:-translate-y-1 transition-transform disabled:opacity-30 disabled:hover:translate-y-0 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
          style={{
            background: name.trim() ? '#0000FF' : 'white',
            color: name.trim() ? 'white' : 'black',
          }}
        >
          INITIALIZE_CONNECTION
        </button>
      </motion.div>
    </div>
  );
}
