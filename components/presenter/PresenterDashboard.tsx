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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col bg-[#0f0f0f] border-r border-[#2a2a2a]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2a2a]">
          <span className="text-xl">⚙️</span>
          <div>
            <p className="text-white font-bold text-sm">I4.0 Workshop</p>
            <p className="text-white/30 text-xs">D-CoE · IISc</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-[#16A34A] text-xs font-medium">{sessionState.participantCount || 0}</span>
          </div>
        </div>

        {/* QR code */}
        {isLobby && qrUrl && (
          <div className="p-4 border-b border-[#2a2a2a]">
            <p className="text-white/30 text-xs text-center mb-2">Scan to join</p>
            <div className="bg-white rounded-xl p-2 mx-auto w-fit">
              <img src={qrUrl} alt="QR Code" className="w-28 h-28" />
            </div>
          </div>
        )}

        {/* Activity selector */}
        <div className="px-4 py-3 flex-1">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Activities</p>
          <div className="space-y-2">
            {ACTIVITIES.map(act => (
              <button
                key={act.id}
                onClick={() => setSelected(act.id)}
                disabled={isActive}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selected === act.id && !isActive
                    ? 'bg-[#16A34A]/20 border border-[#16A34A]/40'
                    : 'border border-transparent hover:bg-[#1a1a1a]'
                } disabled:opacity-50`}
              >
                <span className="text-xl">{act.emoji}</span>
                <div>
                  <p className="text-white text-sm font-medium">{act.label}</p>
                  <p className="text-white/30 text-xs">{act.desc}</p>
                </div>
                {sessionState.currentActivity === act.id && (
                  <span className="ml-auto text-[#BEF264] text-xs">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Config & controls */}
        <div className="px-4 py-4 border-t border-[#2a2a2a] space-y-3">
          {/* Config options */}
          {!isActive && selected === 'mythBuster' && (
            <select
              value={mythIndex}
              onChange={e => setMythIndex(Number(e.target.value))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            >
              {MYTHS.map((m, i) => (
                <option key={m.id} value={i}>Round {i + 1}: {m.statement.slice(0, 35)}…</option>
              ))}
            </select>
          )}
          {!isActive && selected === 'techStack' && (
            <select
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            >
              {STACK_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.text.slice(0, 50)}…</option>
              ))}
            </select>
          )}

          {/* Progress */}
          {isActive && (
            <LiveCounter
              current={sessionState.responseCount || 0}
              total={sessionState.participantCount || 0}
            />
          )}

          {/* Action buttons */}
          {isLobby && (
            <button
              onClick={startActivity}
              disabled={sessionState.participantCount === 0}
              className="w-full py-3 rounded-xl bg-[#16A34A] text-white font-bold text-sm hover:bg-green-500 transition-colors disabled:opacity-40"
            >
              Start activity →
            </button>
          )}
          {isActive && (
            <button
              onClick={() => sendCommand('reveal')}
              className="w-full py-3 rounded-xl bg-[#BEF264] text-black font-bold text-sm hover:bg-lime-300 transition-colors"
            >
              Reveal results ✨
            </button>
          )}
          {(isReveal || sessionState.phase === 'discuss') && (
            <button
              onClick={() => sendCommand('reset')}
              className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white/60 font-bold text-sm hover:bg-[#2a2a2a] transition-colors border border-[#2a2a2a]"
            >
              ← Next activity
            </button>
          )}
        </div>
      </div>

      {/* ── Main display ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Phase bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">Phase:</span>
            <span className={`text-sm font-semibold ${
              isActive ? 'text-[#BEF264]' : isReveal ? 'text-orange-400' : 'text-white/40'
            }`}>
              {sessionState.phase.toUpperCase()}
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
                className="flex flex-col items-center justify-center h-full gap-6 text-center"
              >
                <div className="space-y-3">
                  <p className="text-white/20 text-sm uppercase tracking-widest">Waiting for participants</p>
                  <p className="text-white font-bold text-3xl">Industry 4.0 Workshop</p>
                  <p className="text-white/40">
                    {sessionState.participantCount === 0
                      ? 'Share the QR code to get started'
                      : `${sessionState.participantCount} people in the room`}
                  </p>
                </div>
                {qrUrl && (
                  <div className="bg-white rounded-2xl p-3">
                    <img src={qrUrl} alt="QR" className="w-48 h-48" />
                  </div>
                )}
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
