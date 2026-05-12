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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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
  const isDark = theme === 'dark';

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';
  const border = isDark ? 'border-white' : 'border-black';
  const invertBg = isDark ? 'bg-white' : 'bg-black';
  const invertText = isDark ? 'text-black' : 'text-white';
  const highlightBg = isDark ? 'bg-[#BEF264]' : 'bg-[#0000FF]';
  const highlightText = isDark ? 'text-black' : 'text-white';

  return (
    <div className={`flex h-screen overflow-hidden ${bg} ${text} font-mono uppercase selection:bg-[#FF0000] selection:text-white`}>
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className={`w-80 shrink-0 flex flex-col border-r-4 ${border} z-10`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b-4 ${border}`}>
          <div className={`w-8 h-8 ${invertBg} ${invertText} flex items-center justify-center font-bold text-xl`}>
            !
          </div>
          <div>
            <p className="font-bold text-lg tracking-tighter leading-none">I4.0 WORKSHOP</p>
            <p className="text-[10px] font-bold tracking-widest mt-1">D-COE // IISC</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className={`w-8 h-8 flex items-center justify-center border-2 ${border} hover:${invertBg} hover:${invertText} transition-none font-bold`}
              title="Toggle Theme"
            >
              {isDark ? 'L' : 'D'}
            </button>
            <div className={`flex items-center gap-2 px-2 py-1 border-2 ${border}`}>
              <div className={`w-3 h-3 ${isDark ? 'bg-[#BEF264]' : 'bg-[#0000FF]'}`} />
              <span className="text-sm font-bold">{sessionState.participantCount || 0}</span>
            </div>
          </div>
        </div>

        {/* QR code */}
        {isLobby && qrUrl && (
          <div className={`p-4 border-b-4 ${border} bg-[#FF0000]`}>
            <p className="text-xs font-bold text-white text-center mb-2 tracking-widest">SCAN.TO.JOIN</p>
            <div className="bg-white p-2 mx-auto w-fit border-4 border-black">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
            </div>
          </div>
        )}

        {/* Activity selector */}
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest mb-4">SELECT.ACTIVITY</p>
          <div className="space-y-3">
            {ACTIVITIES.map(act => (
              <button
                key={act.id}
                onClick={() => setSelected(act.id)}
                disabled={isActive}
                className={`w-full flex items-start gap-3 p-3 text-left border-2 ${border} ${
                  selected === act.id && !isActive
                    ? `${invertBg} ${invertText}`
                    : `hover:${highlightBg} hover:${highlightText}`
                } disabled:opacity-30 disabled:cursor-not-allowed transition-none`}
              >
                <span className="text-2xl leading-none mt-1">{act.emoji}</span>
                <div>
                  <p className="text-lg font-bold leading-tight">{act.label}</p>
                  <p className="text-[10px] tracking-widest mt-1 opacity-80">{act.desc}</p>
                </div>
                {sessionState.currentActivity === act.id && (
                  <span className={`ml-auto text-xl font-bold ${selected === act.id && !isActive ? invertText : highlightText}`}>*</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Config & controls */}
        <div className={`px-4 py-4 border-t-4 ${border} space-y-4`}>
          {/* Config options */}
          {!isActive && selected === 'mythBuster' && (
            <select
              value={mythIndex}
              onChange={e => setMythIndex(Number(e.target.value))}
              className={`w-full ${bg} ${text} border-2 ${border} px-3 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#FF0000] appearance-none rounded-none`}
            >
              {MYTHS.map((m, i) => (
                <option key={m.id} value={i}>ROUND {i + 1} // {m.statement.slice(0, 20)}…</option>
              ))}
            </select>
          )}
          {!isActive && selected === 'techStack' && (
            <select
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              className={`w-full ${bg} ${text} border-2 ${border} px-3 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#FF0000] appearance-none rounded-none`}
            >
              {STACK_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.id} // {s.text.slice(0, 20)}…</option>
              ))}
            </select>
          )}

          {/* Progress */}
          {isActive && (
            <div className={`p-4 border-4 ${border} ${highlightBg} ${highlightText}`}>
              <p className="text-xs font-bold mb-1 tracking-widest">RESPONSES</p>
              <p className="text-4xl font-bold leading-none">{sessionState.responseCount || 0} / {sessionState.participantCount || 0}</p>
            </div>
          )}

          {/* Action buttons */}
          {isLobby && (
            <button
              onClick={startActivity}
              disabled={sessionState.participantCount === 0}
              className={`w-full py-4 border-4 ${border} ${invertBg} ${invertText} font-bold text-xl hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-none disabled:opacity-30`}
            >
              START.NOW
            </button>
          )}
          {isActive && (
            <button
              onClick={() => sendCommand('reveal')}
              className={`w-full py-4 border-4 border-black bg-[#BEF264] text-black font-bold text-xl hover:bg-[#FF0000] hover:text-white transition-none`}
            >
              REVEAL.RESULTS
            </button>
          )}
          {(isReveal || sessionState.phase === 'discuss') && (
            <button
              onClick={() => sendCommand('reset')}
              className={`w-full py-4 border-4 ${border} bg-transparent ${text} font-bold text-lg hover:${invertBg} hover:${invertText} transition-none`}
            >
              // RESET.SYSTEM
            </button>
          )}
        </div>
      </div>

      {/* ── Main display ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        {/* Phase bar */}
        <div className={`flex items-center justify-between px-8 py-4 border-b-4 ${border} ${invertBg} ${invertText}`}>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-widest">CURRENT.PHASE:</span>
            <span className="text-2xl font-bold">
              [{sessionState.phase.toUpperCase()}]
            </span>
          </div>
        </div>

        {/* Activity content */}
        <div className={`flex-1 overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM4ODgiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')]`}>
          <AnimatePresence mode="wait">
            {isLobby ? (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-8 p-12"
              >
                <div className={`border-8 ${border} p-16 max-w-4xl w-full ${bg} shadow-[16px_16px_0px_rgba(255,0,0,1)]`}>
                  <p className="text-sm font-bold tracking-widest mb-4">SYSTEM.STATUS: WAITING</p>
                  <h2 className="text-6xl md:text-8xl font-black leading-none mb-8 break-words tracking-tighter">
                    INDUSTRY<br/>4.0<br/>WORKSHOP
                  </h2>
                  <div className={`inline-block border-4 ${border} px-6 py-3 font-bold text-2xl ${highlightBg} ${highlightText}`}>
                    {sessionState.participantCount === 0
                      ? 'AWAITING.CONNECTIONS...'
                      : `ACTIVE.NODES: ${sessionState.participantCount}`}
                  </div>
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
