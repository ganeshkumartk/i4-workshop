import { NextResponse } from 'next/server';
import { updateSession, getPublicState } from '@/lib/store';
import { handleParticipantResponseSync } from '@/lib/activityEngine';

export async function POST(req: Request) {
  const { id, activityId, data } = await req.json();
  if (!id || !activityId) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const newState = await updateSession((state) => {
    handleParticipantResponseSync(state, id, activityId, data);
  });

  return NextResponse.json(getPublicState(newState));
}
