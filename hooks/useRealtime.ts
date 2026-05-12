'use client';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

export interface PublicSessionState {
  phase: string;
  currentActivity: string | null;
  activityConfig: Record<string, unknown>;
  participantCount: number;
  responseCount: number;
  assignments?: Record<string, unknown>;
  responses?: Record<string, unknown>;
  results?: Record<string, unknown> | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useRealtimeState() {
  const { data, error, mutate } = useSWR<PublicSessionState>('/api/state', fetcher, {
    refreshInterval: 1500, // Poll every 1.5s
    revalidateOnFocus: true,
  });

  return {
    state: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useEmit() {
  const { mutate } = useRealtimeState();

  return useCallback(async (event: string, data?: any) => {
    let endpoint = '';
    
    if (event === 'join_session') {
      endpoint = '/api/participant/join';
    } else if (event === 'submit_response') {
      endpoint = '/api/participant/submit';
      // client expects to pass { activityId, data } but we also need a stable ID.
      // we'll just pull a random ID from localStorage to simulate socket.id
      let id = localStorage.getItem('i40_participant_id');
      if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('i40_participant_id', id);
      }
      data = { ...data, id };
    } else if (event === 'presenter_command') {
      endpoint = '/api/presenter/command';
    } else {
      console.warn('Unknown event emitted:', event);
      return;
    }

    if (event === 'join_session') {
      let id = localStorage.getItem('i40_participant_id');
      if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('i40_participant_id', id);
      }
      data = { ...data, id };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
      });
      if (res.ok) {
        const newState = await res.json();
        mutate(newState, false);
      } else {
        const err = await res.json();
        if (err.error === 'Wrong PIN') {
          alert('Wrong Presenter PIN');
        }
      }
    } catch (e) {
      console.error('Failed to emit event', event, e);
    }
  }, [mutate]);
}

export function useParticipantId() {
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    let storedId = localStorage.getItem('i40_participant_id');
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('i40_participant_id', storedId);
    }
    setId(storedId);
  }, []);
  
  return id;
}
