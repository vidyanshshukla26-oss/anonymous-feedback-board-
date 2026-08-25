import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getLatestLedger,
  listFeedback,
  pollFeedbackEvents,
  type Feedback,
} from '../lib/contractClient';
import { CONTRACT_ID } from '../config';

const POLL_MS = 4000;

export function useFeedbackFeed() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const cursorRef = useRef(0);

  const refreshFromContract = useCallback(async () => {
    if (!CONTRACT_ID) {
      setFeedbacks([]);
      setLoading(false);
      return;
    }

    try {
      const items = await listFeedback();
      setFeedbacks(items.slice().reverse());
    } catch {
      // Keep existing items on read failure
    } finally {
      setLoading(false);
    }
  }, []);

  const pollEvents = useCallback(async () => {
    if (!CONTRACT_ID) return;

    try {
      if (cursorRef.current === 0) {
        cursorRef.current = Math.max(1, (await getLatestLedger()) - 5);
      }

      const { events, cursor } = await pollFeedbackEvents(cursorRef.current);
      cursorRef.current = cursor + 1;

      if (events.length > 0) {
        await refreshFromContract();
      }
    } catch {
      // Fall back to contract reads only
    }
  }, [refreshFromContract]);

  useEffect(() => {
    void refreshFromContract();
  }, [refreshFromContract]);

  useEffect(() => {
    if (!CONTRACT_ID) return;

    const id = window.setInterval(() => {
      void pollEvents();
      void refreshFromContract();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [pollEvents, refreshFromContract]);

  return { feedbacks, loading, refresh: refreshFromContract };
}
