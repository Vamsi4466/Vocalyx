'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/constants';
import { getVoice } from '@/lib/utils';
import { IBook, Messages } from '@/types';
import { startVoiceSession, endVoiceSession } from '@/lib/actions/session.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;

let vapiInstance: Vapi | null = null;
function getVapi() {
  if (!vapiInstance) {
    if (!VAPI_API_KEY) throw new Error('NEXT_PUBLIC_VAPI_API_KEY is not set');
    vapiInstance = new Vapi(VAPI_API_KEY);
  }
  return vapiInstance;
}

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

export function useVapi(book: IBook) {
  const [user, setUser] = useState<any>(null);

  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef(false);

  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) { console.error('Failed to load user', err); }
    };
    loadUser();
  }, []);

  // -----------------------
  // VAPI EVENT LISTENERS
  // -----------------------
  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => {
      isStoppingRef.current = false;
      setStatus('starting');
      setCurrentMessage('');
      setCurrentUserMessage('');

      startTimeRef.current = Date.now();
      setDuration(0);

      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const newDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(newDuration);
      }, TIMER_INTERVAL_MS);
    };

    const onCallEnd = () => {
      setStatus('idle');
      setCurrentMessage('');
      setCurrentUserMessage('');

      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      startTimeRef.current = null;

      if (sessionIdRef.current) {
        endVoiceSession(sessionIdRef.current, durationRef.current).catch(console.error);
        sessionIdRef.current = null;
      }
    };

    const onSpeechStart = () => { if (!isStoppingRef.current) setStatus('speaking'); };
    const onSpeechEnd = () => { if (!isStoppingRef.current) setStatus('listening'); };

    const onMessage = (message: any) => {
      if (message.type !== 'transcript') return;

      if (message.role === 'user' && message.transcriptType === 'partial') {
        setCurrentUserMessage(message.transcript); return;
      }
      if (message.role === 'assistant' && message.transcriptType === 'partial') {
        setCurrentMessage(message.transcript); return;
      }
      if (message.transcriptType === 'final') {
        if (message.role === 'assistant') setCurrentMessage('');
        if (message.role === 'user') setCurrentUserMessage('');

        setMessages((prev) => {
          const exists = prev.some(m => m.role === message.role && m.content === message.transcript);
          if (exists) return prev;
          return [...prev, { role: message.role, content: message.transcript }];
        });

        if (message.role === 'user') setStatus('thinking');
      }
    };

    const onError = (err: any) => {
      console.warn('Vapi session ended:', err?.message || err);
      setLimitError('Voice session ended. Tap mic to start again.');
      setStatus('idle'); setCurrentMessage(''); setCurrentUserMessage('');
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (sessionIdRef.current) { endVoiceSession(sessionIdRef.current, durationRef.current).catch(console.error); sessionIdRef.current = null; }
      startTimeRef.current = null;
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);

      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // <- empty dependency ensures timer updates correctly

  // -----------------------
  // START / STOP
  // -----------------------
  const start = useCallback(async () => {
    if (!user?.$id) { setLimitError('Please sign in to start a voice session.'); return; }
    setLimitError(null); setStatus('connecting');

    try {
      const result = await startVoiceSession(user.$id, book.$id);
      if (!result.success) { setLimitError(result.error || 'Session limit reached.'); setStatus('idle'); return; }
      sessionIdRef.current = result.sessionId || null;

      const firstMessage = `Hey, good to meet you. Quick question before we dive in - have you actually read ${book.title} yet, or are we starting fresh?`;

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: { title: book.title, author: book.author, bookId: book.$id },
        voice: {
          provider: '11labs' as const,
          voiceId: getVoice(voice).id,
          model: 'eleven_turbo_v2_5',
          stability: VOICE_SETTINGS.stability,
          similarityBoost: VOICE_SETTINGS.similarityBoost,
          style: VOICE_SETTINGS.style,
          useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        },
      });
    } catch (err) { console.error('Failed to start call:', err); setStatus('idle'); setLimitError('Failed to start voice session.'); }
  }, [book, user, voice]);

  const stop = useCallback(() => { isStoppingRef.current = true; getVapi().stop(); }, []);
  const clearError = useCallback(() => setLimitError(null), []);
  const isActive = ['starting', 'listening', 'thinking', 'speaking'].includes(status);

  return {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
    limitError,
    clearError,
  };
}

export default useVapi;