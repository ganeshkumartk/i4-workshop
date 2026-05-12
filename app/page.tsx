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
    <div className="h-screen flex flex-col overflow-hidden bg-white text-black font-mono uppercase">
      {!joined ? (
        <JoinScreen onJoined={handleJoined} participantCount={sessionState.participantCount || 0} />
      ) : showActivity ? (
        <div className="flex flex-col h-full border-8 border-black m-4 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-5 py-4 border-b-4 border-black bg-[#BEF264]">
            <span className="text-black font-black text-sm tracking-tighter">NODE: {myName}</span>
            <span className="text-black text-xs font-bold border-2 border-black px-2 py-1 bg-white">{sessionState.responseCount}/{sessionState.participantCount} LOGGED</span>
          </div>
          <div className="flex-1 overflow-hidden bg-white">
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
          className="flex flex-col items-center justify-center h-full gap-6 text-center px-8 border-8 border-black m-4 shadow-[8px_8px_0px_rgba(255,0,0,1)] bg-white"
        >
          {sessionState.phase === 'reveal' || sessionState.phase === 'discuss' ? (
            <>
              <span className="text-6xl border-4 border-black p-4 bg-[#FF0000] shadow-[8px_8px_0px_rgba(0,0,0,1)]">🎉</span>
              <p className="text-3xl font-black text-black tracking-tighter mt-4">RESULTS_ARE_IN</p>
              <p className="text-black bg-[#BEF264] px-4 py-2 border-2 border-black font-bold">WATCH.THE.BIG.SCREEN</p>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 border-2 border-black bg-[#0000FF]"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              </div>
              <p className="text-black text-2xl font-black tracking-tighter">AWAITING_PRESENTER</p>
              <p className="text-black font-bold border-2 border-black px-4 py-2 bg-[#BEF264]">{sessionState.participantCount} NODES ACTIVE</p>
            </>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
