import type { Feedback } from '../lib/contractClient';

interface FeedbackListProps {
  items: Feedback[];
  loading: boolean;
}

export function FeedbackList({ items, loading }: FeedbackListProps) {
  return (
    <section className="feedback-list">
      <div className="section-header">
        <h2>Live Feedback Feed</h2>
        <span className="live-dot" aria-label="Live updates enabled" />
      </div>

      {loading && items.length === 0 && (
        <p className="muted">Loading feedback from contract…</p>
      )}

      {!loading && items.length === 0 && (
        <p className="muted">No feedback yet. Be the first to submit!</p>
      )}

      <ul>
        {items.map((item) => (
          <li key={item.feedback_id}>
            <span className="feedback-id">#{item.feedback_id}</span>
            <p>{item.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
