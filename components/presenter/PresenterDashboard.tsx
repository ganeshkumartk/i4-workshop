'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmit, useRealtimeState } from '@/hooks/useRealtime';
import { MYTHS, STACK_SCENARIOS } from '@/lib/data';
import MythBusterPresenter from './activities/MythBusterPresenter';
import DesignCardPresenter from './activities/DesignCardPresenter';
import TechStackPresenter from './activities/TechStackPresenter';
import BuildYourBotPresenter from './activities/BuildYourBotPresenter';
import LiveCounter from '@/components/shared/LiveCounter';

import AtelierBackground from '@/components/shared/AtelierBackground';

type ActivityId = 'mythBuster' | 'designCard' | 'techStack' | 'buildYourBot';

const ACTIVITIES = [
  { id: 'mythBuster' as ActivityId,   label: 'Myth Buster',    emoji: '💥', desc: '60 sec · MYTH or FACT' },
  { id: 'designCard' as ActivityId,   label: 'Design Card',    emoji: '🎴', desc: '5 min · Smart object' },
  { id: 'techStack' as ActivityId,    label: 'Tech Stack',     emoji: '🔗', desc: '5 min · Pick 3 techs' },
  { id: 'buildYourBot' as ActivityId, label: 'Build Your Bot', emoji: '🤖', desc: '4 min · Design a robot' },
];

export default function PresenterDashboard() {
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  
  const { state: sessionState } = useRealtimeState();

  const [selected, setSelected] = useState<ActivityId>('mythBuster');
  const [mythIndex, setMythIndex] = useState(0);
  const [scenarioId, setScenarioId] = useState('s1');
  const [qrUrl, setQrUrl] = useState('');
  const emit = useEmit();

  useEffect(() => {
    setQrUrl('/api/qr.png');
  }, []);

  function authenticate() {
    setAuthed(true); // For now trust locally
  }

  function sendCommand(command: string, payload?: Record<string, unknown>) {
    emit('presenter_command', { pin, command, payload: payload || {} });
  }

  function startActivity() {
    let config: Record<string, unknown> = {};
    if (selected === 'mythBuster') config = { mythIndex };
    if (selected === 'techStack') config = { scenarioId };
    sendCommand('start_activity', { activityId: selected, config });
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-6">
        <div className="text-4xl">🔑</div>
        <h1 className="text-2xl font-bold text-white">Presenter Access</h1>
        <div className="flex gap-3">
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && authenticate()}
            className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-5 py-3 text-white text-center text-xl tracking-widest w-40 focus:outline-none focus:border-[#16A34A]"
          />
          <button
            onClick={authenticate}
            className="px-6 py-3 bg-[#16A34A] rounded-xl font-bold hover:bg-green-500 transition-colors"
          >
            Enter →
          </button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-white/20 text-xs">Default PIN: 1234</p>
      </div>
    );
  }

  if (!sessionState) return null;

  const isActive = sessionState.phase === 'active';
  const isReveal = sessionState.phase === 'reveal';
  const isLobby = sessionState.phase === 'lobby';

  // Atelier-luxe palette mapping
  const panelBg = 'bg-[#FAF8F5]/80 border-[#E8E4DF]';
  const textColor = 'text-[#1C1C1C]';
  const mutedText = 'text-[#6B6560]';
  const inputBg = 'bg-[#F2EDE6] border-[#E8E4DF]';
  const accentText = 'text-[#8B7D56]'; // Aged brass
  const accentBg = 'bg-[#8B7D56] text-white hover:bg-[#7A6C4A]';

  return (
    <div className={`flex h-screen overflow-hidden ${textColor} relative bg-[#F9F8F6] font-serif selection:bg-[#E8E4DF]`}>
      <AtelierBackground />
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className={`w-80 shrink-0 flex flex-col ${panelBg} backdrop-blur-xl border-r z-10`}>
        {/* Logo */}
        <div className={`flex items-center gap-4 px-6 py-6 border-b border-[#E8E4DF]`}>
          <div>
            <p className="font-semibold text-lg tracking-tight">I4.0 Workshop</p>
            <p className={`text-xs uppercase tracking-[0.15em] mt-1 ${mutedText}`}>D-CoE · IISc</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8B7D56]" />
            <span className={`${accentText} text-xs font-medium font-sans tracking-widest`}>{sessionState.participantCount || 0}</span>
          </div>
        </div>

        {/* QR code */}
        {isLobby && qrUrl && (
          <div className={`p-6 border-b border-[#E8E4DF] flex flex-col items-center`}>
            <p className={`text-[10px] uppercase tracking-[0.2em] mb-4 ${mutedText}`}>Scan to enter</p>
            <div className="bg-white p-3 border border-[#E8E4DF] shadow-sm">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32 opacity-90 mix-blend-multiply" />
            </div>
          </div>
        )}

        {/* Activity selector */}
        <div className="px-6 py-6 flex-1">
          <p className={`text-[10px] uppercase tracking-[0.2em] mb-4 ${mutedText}`}>Exhibition</p>
          <div className="space-y-1">
            {ACTIVITIES.map(act => (
              <button
                key={act.id}
                onClick={() => setSelected(act.id)}
                disabled={isActive}
                className={`w-full flex items-start gap-4 p-4 text-left transition-all duration-500 ease-out border-b ${
                  selected === act.id && !isActive
                    ? 'border-[#1C1C1C]'
                    : 'border-transparent hover:border-[#E8E4DF]'
                } disabled:opacity-40`}
              >
                <span className="text-lg opacity-80 mt-0.5 grayscale">{act.emoji}</span>
                <div>
                  <p className="text-sm font-medium tracking-wide">{act.label}</p>
                  <p className={`text-xs mt-1 font-sans ${mutedText} leading-relaxed`}>{act.desc}</p>
                </div>
                {sessionState.currentActivity === act.id && (
                  <span className={`ml-auto ${accentText} text-[10px] tracking-widest`}>ACTIVE</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Config & controls */}
        <div className={`px-6 py-6 border-t border-[#E8E4DF] space-y-4`}>
          {/* Config options */}
          {!isActive && selected === 'mythBuster' && (
            <select
              value={mythIndex}
              onChange={e => setMythIndex(Number(e.target.value))}
              className={`w-full ${inputBg} border px-4 py-3 text-sm font-sans focus:outline-none appearance-none cursor-pointer`}
            >
              {MYTHS.map((m, i) => (
                <option key={m.id} value={i}>Statement {i + 1}: {m.statement.slice(0, 35)}…</option>
              ))}
            </select>
          )}
          {!isActive && selected === 'techStack' && (
            <select
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              className={`w-full ${inputBg} border px-4 py-3 text-sm font-sans focus:outline-none appearance-none cursor-pointer`}
            >
              {STACK_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.text.slice(0, 50)}…</option>
              ))}
            </select>
          )}

          {/* Progress */}
          {isActive && (
            <div className="py-2">
              <LiveCounter
                current={sessionState.responseCount || 0}
                total={sessionState.participantCount || 0}
              />
            </div>
          )}

          {/* Action buttons */}
          {isLobby && (
            <button
              onClick={startActivity}
              disabled={sessionState.participantCount === 0}
              className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-30 ${accentBg}`}
            >
              Begin
            </button>
          )}
          {isActive && (
            <button
              onClick={() => sendCommand('reveal')}
              className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-all duration-500 bg-[#1C1C1C] text-white hover:bg-[#2A2A2A]`}
            >
              Reveal
            </button>
          )}
          {(isReveal || sessionState.phase === 'discuss') && (
            <button
              onClick={() => sendCommand('reset')}
              className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-all duration-500 border border-[#1C1C1C] hover:bg-[#E8E4DF]`}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* ── Main display ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 font-sans">
        {/* Phase bar */}
        <div className={`flex items-center justify-between px-10 py-5 border-b border-[#E8E4DF] bg-transparent`}>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] uppercase tracking-[0.2em] ${mutedText}`}>Status</span>
            <span className={`text-xs uppercase tracking-[0.15em] font-medium ${
              isActive ? accentText : isReveal ? 'text-[#1C1C1C]' : mutedText
            }`}>
              {sessionState.phase}
            </span>
          </div>
          {isActive && (
            <LiveCounter
              current={sessionState.responseCount || 0}
              total={sessionState.participantCount || 0}
            />
          )}
        </div>

        {/* Activity content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {isLobby ? (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="flex flex-col items-center justify-center h-full gap-8 text-center"
              >
                <div className="space-y-6 max-w-lg mx-auto">
                  <p className={`text-xs uppercase tracking-[0.3em] ${mutedText}`}>Arrival</p>
                  <h1 className="font-serif text-5xl font-light tracking-tight text-[#1C1C1C] leading-[1.1]">
                    Industry 4.0
                  </h1>
                  <p className={`text-sm font-sans tracking-wide leading-relaxed ${mutedText}`}>
                    {sessionState.participantCount === 0
                      ? 'Please scan the code to enter the exhibition.'
                      : `${sessionState.participantCount} guests present.`}
                  </p>
                </div>
              </motion.div>
            ) : sessionState.currentActivity === 'mythBuster' ? (
              <motion.div key="myth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <MythBusterPresenter
                  config={sessionState.activityConfig as { mythIndex?: number }}
                  participantCount={sessionState.participantCount || 0}
                  responses={sessionState.responses as any}
                  results={sessionState.results as any}
                />
              </motion.div>
            ) : sessionState.currentActivity === 'designCard' ? (
              <motion.div key="design" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <DesignCardPresenter participantCount={sessionState.participantCount || 0} responses={sessionState.responses as any} />
              </motion.div>
            ) : sessionState.currentActivity === 'techStack' ? (
              <motion.div key="tech" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <TechStackPresenter
                  config={sessionState.activityConfig as { scenarioId?: string }}
                  participantCount={sessionState.participantCount || 0}
                  responses={sessionState.responses as any}
                />
              </motion.div>
            ) : sessionState.currentActivity === 'buildYourBot' ? (
              <motion.div key="bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <BuildYourBotPresenter participantCount={sessionState.participantCount || 0} responses={sessionState.responses as any} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
