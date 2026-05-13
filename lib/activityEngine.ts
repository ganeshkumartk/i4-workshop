import { SessionState } from './store';
import { DESIGN_OBJECTS, STACK_SCENARIOS } from './data';

const PRESENTER_PIN = process.env.PRESENTER_PIN || '1234';

export function resetActivityState(state: SessionState) {
  state.responses = {};
  state.assignments = {};
  state.activityConfig = {};
  state.currentActivity = null;
  state.phase = 'lobby';
  state.results = null;
}

export function handlePresenterCommandSync(
  state: SessionState,
  command: string,
  payload: Record<string, unknown>
) {
  switch (command) {
    case 'start_activity': {
      const { activityId, config } = payload as { activityId: string; config: Record<string, unknown> };
      resetActivityState(state);
      state.botNameCounter = 0; // reset bot names
      state.currentActivity = activityId as any;
      state.activityConfig = config || {};
      state.phase = 'active';

      // Pre-assign objects for design card
      if (activityId === 'designCard') {
        let i = 0;
        for (const socketId of Object.keys(state.participants)) {
          state.assignments[socketId] = DESIGN_OBJECTS[i % DESIGN_OBJECTS.length];
          i++;
        }
      }
      break;
    }

    case 'reveal': {
      state.phase = 'reveal';
      state.results = computeResults(state);
      break;
    }

    case 'discuss': {
      state.phase = 'discuss';
      break;
    }

    case 'reset': {
      resetActivityState(state);
      break;
    }
  }
}

export function handleParticipantResponseSync(
  state: SessionState,
  socketId: string,
  activityId: string,
  data: unknown
) {
  if (state.currentActivity !== activityId || state.phase !== 'active') return;

  const participant = state.participants[socketId];
  const responseData: any = { ...(data as Record<string, unknown>), participantName: participant?.name };

  state.responses[socketId] = responseData;
}

function computeResults(state: SessionState) {
  const responses = Object.values(state.responses);

  switch (state.currentActivity) {
    case 'mythBuster': {
      const myth = responses.filter((r: any) => r.vote === 'MYTH').length;
      const fact = responses.filter((r: any) => r.vote === 'FACT').length;
      const timings = responses
        .map((r: any) => r)
        .filter(r => r.vote)
        .sort((a, b) => (a.timeMs as number) - (b.timeMs as number))
        .slice(0, 3)
        .map(r => ({ name: r.participantName, timeMs: r.timeMs }));
      return { myth, fact, total: responses.length, fastest: timings };
    }

    case 'designCard': {
      return { cards: responses };
    }

    case 'techStack': {
      const techCounts: Record<string, number> = {};
      const coOccurrence: Record<string, Record<string, number>> = {};
      for (const r of responses) {
        const picks = (r as any).picks || [];
        picks.forEach((t: string) => { techCounts[t] = (techCounts[t] || 0) + 1; });
        picks.forEach((a: string) => {
          picks.forEach((b: string) => {
            if (a !== b) {
              coOccurrence[a] = coOccurrence[a] || {};
              coOccurrence[a][b] = (coOccurrence[a][b] || 0) + 1;
            }
          });
        });
      }
      return { techCounts, coOccurrence, total: responses.length };
    }

    case 'bottleneck': {
      return { diagnoses: responses };
    }

    default:
      return {};
  }
}

export function verifyPresenterPin(pin: string) {
  return pin === PRESENTER_PIN;
}

export function getScenario(id?: string) {
  return STACK_SCENARIOS.find(s => s.id === id) || STACK_SCENARIOS[0];
}
