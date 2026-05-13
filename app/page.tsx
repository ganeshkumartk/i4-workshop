'use client';
import { useState } from 'react';
import { useRealtimeState, useParticipantId } from '@/hooks/useRealtime';
import JoinScreen from '@/components/participant/JoinScreen';
import MythBusterParticipant from '@/components/participant/activities/MythBusterParticipant';
import DesignCardParticipant from '@/components/participant/activities/DesignCardParticipant';
import TechStackParticipant from '@/components/participant/activities/TechStackParticipant';
import BuildYourBotParticipant from '@/components/participant/activities/BuildYourBotParticipant';
import { motion } from 'framer-motion';

export default function ParticipantPage() {
  const [joined, setJoined] = useState(false);
  const [myName, setMyName] = useState('');
  const participantId = useParticipantId();
  const { state: sessionState } = useRealtimeState();

  function handleJoined(name: string) {
    setMyName(name);
    setJoined(true);
  }

  if (!sessionState) return null; // Or a loading spinner

  const activity = sessionState.currentActivity;
  const showActivity = joined && sessionState.phase === 'active' && activity;
  const showWaiting = joined && (sessionState.phase === 'lobby' || sessionState.phase === 'discuss' || sessionState.phase === 'reveal');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0B0B0B]">
      {!joined ? (
        <JoinScreen onJoined={handleJoined} participantCount={sessionState.participantCount || 0} />
      ) : showActivity ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
            <span className="text-white/50 text-sm font-medium">Hey, {myName} 👋</span>
            <span className="text-white/30 text-xs">{sessionState.responseCount}/{sessionState.participantCount} responded</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {activity === 'mythBuster' && (
              <MythBusterParticipant config={(sessionState.activityConfig || {}) as { mythIndex?: number }} />
            )}
            {activity === 'designCard' && (
              <DesignCardParticipant
                assignments={sessionState.assignments as any}
                socketId={participantId}
              />
            )}
            {activity === 'techStack' && (
              <TechStackParticipant config={(sessionState.activityConfig || {}) as { scenarioId?: string }} />
            )}
            {activity === 'buildYourBot' && (
              <BuildYourBotParticipant />
            )}
          </div>
        </div>
      ) : showWaiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full gap-4 text-center px-8"
        >
          {sessionState.phase === 'reveal' || sessionState.phase === 'discuss' ? (
            <>
              <span className="text-5xl">🎉</span>
              <p className="text-xl font-bold text-[#BEF264]">Results are in!</p>
              <p className="text-white/40 text-sm">Watch the big screen</p>
            </>
          ) : (
            <>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#16A34A]"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="text-white/50 text-lg font-medium">Waiting for the presenter…</p>
              <p className="text-white/30 text-xs">{sessionState.participantCount} people in the room</p>
            </>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
