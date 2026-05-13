'use client';
import { useState } from 'react';
import { useRealtimeState, useParticipantId } from '@/hooks/useRealtime';
import JoinScreen from '@/components/participant/JoinScreen';
import MythBusterParticipant from '@/components/participant/activities/MythBusterParticipant';
import DesignCardParticipant from '@/components/participant/activities/DesignCardParticipant';
import TechStackParticipant from '@/components/participant/activities/TechStackParticipant';
import BottleneckAnalystParticipant from '@/components/participant/activities/BottleneckAnalystParticipant';
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
    <div className="h-dvh flex flex-col overflow-hidden bg-[#F9F8F6] text-[#1C1C1C] font-sans selection:bg-[#E8E4DF]">
      {!joined ? (
        <JoinScreen onJoined={handleJoined} participantCount={sessionState.participantCount || 0} />
      ) : showActivity ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E8E4DF] bg-white/50 backdrop-blur-md z-10 shrink-0">
            <span className="text-[#1C1C1C] font-serif text-sm font-medium">Guest: {myName}</span>
            <span className="text-[#6B6560] text-[10px] font-bold uppercase tracking-[0.2em]">{sessionState.responseCount}/{sessionState.participantCount} responses</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
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
              {activity === 'bottleneck' && (
                <BottleneckAnalystParticipant config={(sessionState.activityConfig || {}) as { scenarioId?: string }} />
              )}
            </div>
          </div>
        </div>
      ) : showWaiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex flex-col items-center justify-center h-full gap-6 text-center px-6 sm:px-8 pb-[env(safe-area-inset-bottom)]"
        >
          {sessionState.phase === 'reveal' || sessionState.phase === 'discuss' ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7D56] mb-2">Conclusion</p>
              <p className="text-2xl sm:text-3xl font-serif font-medium text-[#1C1C1C] leading-snug">Please direct your attention<br/>to the main screen</p>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#1C1C1C]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <p className="text-[#1C1C1C] font-serif text-xl sm:text-2xl font-medium">Awaiting presentation</p>
              <p className="text-[#6B6560] font-bold text-[10px] uppercase tracking-[0.2em] mt-2">{sessionState.participantCount} guests present</p>
            </>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
