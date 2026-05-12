import { NextResponse } from 'next/server';
import { getSession, getPublicState } from '@/lib/store';

export async function GET() {
  const session = await getSession();
  return NextResponse.json(getPublicState(session));
}
