import { type FormEvent, useEffect, useState } from 'react';
import './App.css';
import { API_BASE_URL, fetchHealth, sendChat } from './lib/api';

type HealthState =
  | { status: 'loading' }
  | { status: 'ready'; env: string }
  | { status: 'error'; message: string };

function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await fetchHealth();
        setHealth({ status: 'ready', env: data.env });
      } catch (err) {
        setHealth({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unexpected error',
        });
      }
    };

    loadHealth();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setIsChatting(true);
    setChatError(null);

    try {
      const response = await sendChat({ message, history });
      setReply(response.reply);
      setHistory((prev) => [...prev, `You: ${message}`, `Bot: ${response.reply}`]);
      setMessage('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <main className="layout">
      <header>
        <div>
          <p className="eyebrow">Hacknation</p>
          <h1>LLM chat playground</h1>
          <p className="subtitle">
            Frontend talking to the FastAPI backend over <code>{API_BASE_URL}</code>.
          </p>
        </div>
        <div className="pill">
          {health.status === 'loading' && 'Checking health…'}
          {health.status === 'ready' && `Backend: ${health.env}`}
          {health.status === 'error' && `Health error: ${health.message}`}
        </div>
      </header>

      <section className="card">
        <h2>Try a message</h2>
        <p className="helper">
          Sends POST to <code>/chat/completion</code> with minimal history tracking.
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="message">Message</label>
          <div className="input-row">
            <input
              id="message"
              name="message"
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isChatting}
              autoComplete="off"
            />
            <button type="submit" disabled={isChatting}>
              {isChatting ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </form>
        {chatError && <p className="error">Error: {chatError}</p>}
        {reply && (
          <div className="output">
            <p className="label">Latest reply</p>
            <p>{reply}</p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="history-header">
          <h3>History</h3>
          <button
            type="button"
            className="ghost"
            onClick={() => setHistory([])}
            disabled={!history.length}
          >
            Clear
          </button>
        </div>
        {!history.length && <p className="helper">No messages yet.</p>}
        <ul className="history">
          {history.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
