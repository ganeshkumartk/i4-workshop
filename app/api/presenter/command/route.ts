import { NextResponse } from 'next/server';
import { updateSession, getPublicState } from '@/lib/store';
import { handlePresenterCommandSync, verifyPresenterPin } from '@/lib/activityEngine';

export async function POST(req: Request) {
  const { pin, command, payload } = await req.json();
  
  if (!verifyPresenterPin(pin)) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
  }

  const newState = await updateSession((state) => {
    handlePresenterCommandSync(state, command, payload || {});
  });

  return NextResponse.json(getPublicState(newState));
}
