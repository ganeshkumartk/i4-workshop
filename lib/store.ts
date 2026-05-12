import { Redis } from '@upstash/redis';

export type ActivityId = 'mythBuster' | 'designCard' | 'techStack' | 'buildYourBot';
export type Phase = 'lobby' | 'active' | 'reveal' | 'discuss';

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
}

export interface SessionState {
  phase: Phase;
  currentActivity: ActivityId | null;
  activityConfig: Record<string, unknown>;
  participants: Record<string, Participant>;
  responses: Record<string, unknown>;
  assignments: Record<string, unknown>;
  results: Record<string, unknown> | null;
  botNameCounter: number;
}

const DEFAULT_STATE: SessionState = {
  phase: 'lobby',
  currentActivity: null,
  activityConfig: {},
  participants: {},
  responses: {},
  assignments: {},
  results: null,
  botNameCounter: 0,
};

// Use Upstash Redis if configured (for Vercel), otherwise in-memory (for local dev)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

let localState: SessionState = { ...DEFAULT_STATE };

const STATE_KEY = 'i40_workshop_session';

export async function getSession(): Promise<SessionState> {
  if (redis) {
    const data = await redis.get<SessionState>(STATE_KEY);
    return data || DEFAULT_STATE;
  }
  return localState;
}

export async function updateSession(updater: (state: SessionState) => void | SessionState): Promise<SessionState> {
  let state = await getSession();
  
  // Clone to avoid mutating the fallback reference directly if not intended
  state = JSON.parse(JSON.stringify(state));
  
  const newState = updater(state) || state;
  
  if (redis) {
    await redis.set(STATE_KEY, newState);
  } else {
    localState = newState;
  }
  
  return newState;
}

export function getPublicState(state: SessionState) {
  return {
    phase: state.phase,
    currentActivity: state.currentActivity,
    activityConfig: state.activityConfig,
    participantCount: Object.keys(state.participants).length,
    responseCount: Object.keys(state.responses).length,
    assignments: state.currentActivity === 'designCard'
      ? state.assignments
      : undefined,
    responses: state.responses,
    results: state.results,
  };
}
