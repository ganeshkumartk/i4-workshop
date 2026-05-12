import { NextResponse } from 'next/server';
import { updateSession, getPublicState } from '@/lib/store';

export async function POST(req: Request) {
  const { name, id } = await req.json();
  if (!name?.trim() || !id) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const newState = await updateSession((state) => {
    state.participants[id] = {
      id,
      name: name.trim().slice(0, 30),
      joinedAt: Date.now(),
    };
  });

  return NextResponse.json(getPublicState(newState));
}
