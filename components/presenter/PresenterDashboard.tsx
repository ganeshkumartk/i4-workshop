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

import LivingBackground from '@/components/shared/LivingBackground';

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

  const panelBg = isDark ? 'bg-black/60 border-white/10' : 'bg-white/60 border-black/10';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#1a1a1a]/80 border-white/10' : 'bg-slate-100/80 border-black/10';

  const intensity = Math.min((sessionState.participantCount || 0) / 20, 1) + (isActive ? 0.5 : 0) + (isReveal ? 0.8 : 0);

  return (
    <div className={`flex h-screen overflow-hidden ${textColor} relative ${isDark ? 'dark' : ''}`}>
      <LivingBackground theme={theme} intensity={intensity} />
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className={`w-72 shrink-0 flex flex-col ${panelBg} backdrop-blur-xl border-r z-10`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <span className="text-xl">⚙️</span>
          <div>
            <p className="font-bold text-sm">I4.0 Workshop</p>
            <p className={`text-xs ${mutedText}`}>D-CoE · IISc</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="text-lg hover:scale-110 transition-transform mr-2"
              title="Toggle Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-[#16A34A] text-xs font-medium">{sessionState.participantCount || 0}</span>
          </div>
        </div>

        {/* QR code */}
        {isLobby && qrUrl && (
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <p className={`text-xs text-center mb-2 ${mutedText}`}>Scan to join</p>
            <div className="bg-white rounded-xl p-2 mx-auto w-fit shadow-xl">
              <img src={qrUrl} alt="QR Code" className="w-28 h-28" />
            </div>
          </div>
        )}

        {/* Activity selector */}
        <div className="px-4 py-3 flex-1">
          <p className={`text-xs uppercase tracking-wider mb-3 ${mutedText}`}>Activities</p>
          <div className="space-y-2">
            {ACTIVITIES.map(act => (
              <button
                key={act.id}
                onClick={() => setSelected(act.id)}
                disabled={isActive}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selected === act.id && !isActive
                    ? (isDark ? 'bg-[#16A34A]/20 border border-[#16A34A]/40' : 'bg-[#16A34A]/10 border border-[#16A34A]/40')
                    : `border border-transparent hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`
                } disabled:opacity-50`}
              >
                <span className="text-xl">{act.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{act.label}</p>
                  <p className={`text-xs ${mutedText}`}>{act.desc}</p>
                </div>
                {sessionState.currentActivity === act.id && (
                  <span className="ml-auto text-[#16A34A] text-xs">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Config & controls */}
        <div className={`px-4 py-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'} space-y-3`}>
          {/* Config options */}
          {!isActive && selected === 'mythBuster' && (
            <select
              value={mythIndex}
              onChange={e => setMythIndex(Number(e.target.value))}
              className={`w-full ${inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
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
              className={`w-full ${inputBg} rounded-xl px-3 py-2 text-xs focus:outline-none`}
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
              className="w-full py-3 rounded-xl bg-[#16A34A] text-white font-bold text-sm hover:bg-green-500 transition-colors disabled:opacity-40 shadow-lg shadow-green-500/20"
            >
              Start activity →
            </button>
          )}
          {isActive && (
            <button
              onClick={() => sendCommand('reveal')}
              className="w-full py-3 rounded-xl bg-linear-to-r from-[#BEF264] to-[#16A34A] text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
            >
              Reveal results ✨
            </button>
          )}
          {(isReveal || sessionState.phase === 'discuss') && (
            <button
              onClick={() => sendCommand('reset')}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors border ${
                isDark 
                  ? 'bg-white/5 text-white/60 hover:bg-white/10 border-white/10' 
                  : 'bg-black/5 text-black/60 hover:bg-black/10 border-black/10'
              }`}
            >
              ← Next activity
            </button>
          )}
        </div>
      </div>

      {/* ── Main display ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        {/* Phase bar */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-white/40'} backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${mutedText}`}>Phase:</span>
            <span className={`text-sm font-semibold ${
              isActive ? 'text-[#16A34A]' : isReveal ? 'text-orange-500' : mutedText
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
                <div className={`p-12 rounded-3xl ${isDark ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-2xl border ${isDark ? 'border-white/10' : 'border-black/10'} shadow-2xl`}>
                  <div className="space-y-3">
                    <p className={`text-sm uppercase tracking-widest ${mutedText}`}>Waiting for participants</p>
                    <p className="font-bold text-4xl bg-linear-to-r from-[#3B82F6] to-[#16A34A] bg-clip-text text-transparent pb-1">Industry 4.0 Workshop</p>
                    <p className={mutedText}>
                      {sessionState.participantCount === 0
                        ? 'Share the QR code to get started'
                        : `${sessionState.participantCount} people in the room`}
                    </p>
                  </div>
                  {qrUrl && (
                    <div className="mt-8 bg-white rounded-2xl p-4 shadow-xl mx-auto w-fit">
                      <img src={qrUrl} alt="QR" className="w-56 h-56" />
                    </div>
                  )}
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
