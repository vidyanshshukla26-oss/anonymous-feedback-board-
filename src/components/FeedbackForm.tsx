import { useState } from 'react';

interface FeedbackFormProps {
  disabled: boolean;
  submitting: boolean;
  onSubmit: (message: string) => Promise<void>;
}

export function FeedbackForm({
  disabled,
  submitting,
  onSubmit,
}: FeedbackFormProps) {
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    await onSubmit(trimmed);
    setMessage('');
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <label htmlFor="feedback-message">Anonymous feedback</label>
      <textarea
        id="feedback-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Share your thoughts anonymously…"
        rows={4}
        maxLength={280}
        disabled={disabled || submitting}
      />
      <div className="form-footer">
        <span>{message.length}/280</span>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled || submitting || !message.trim()}
        >
          {submitting ? 'Submitting…' : 'Send Feedback'}
        </button>
      </div>
    </form>
  );
}
