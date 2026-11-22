import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  getAiSettings,
  updateAiSettings,
  type AiSettings,
} from '../api/settings.js';

export default function AdminSettingsPage(): JSX.Element {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getAiSettings();
      setSettings(data);
      setModel(data.model ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const input: { api_key?: string; model?: string | null } = {};
      if (apiKey.trim().length > 0) {
        input.api_key = apiKey.trim();
      }
      input.model = model.trim().length > 0 ? model.trim() : null;
      const updated = await updateAiSettings(input);
      setSettings(updated);
      setApiKey('');
      setModel(updated.model ?? '');
      setMessage('AI settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  return (
    <div>
      <p>
        <Link to="/dashboard">&larr; Back to dashboard</Link>
      </p>
      <h2>AI Settings</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Groq (AI question generation)</h3>
        {settings && (
          <p style={{ color: 'var(--color-muted)' }}>
            Current API key:{' '}
            {settings.key_error ? (
              <strong className="error">unreadable — please re-enter it</strong>
            ) : settings.has_key ? (
              <code>{settings.masked_key}</code>
            ) : (
              'not set'
            )}
          </p>
        )}
        <form onSubmit={(e) => { void handleSave(e); }}>
          <label htmlFor="apiKey">API key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={settings?.has_key ? 'Leave blank to keep the current key' : 'gsk_...'}
            autoComplete="off"
          />
          <label htmlFor="aiModel">Default model</label>
          <input
            id="aiModel"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. llama-3.3-70b-versatile (blank = built-in default)"
          />
          <p style={{ color: 'var(--color-muted)' }}>
            The key is stored encrypted and is never shown again — only its last 4
            characters. Lecturers can pick a different model per generation; this
            value is the default.
          </p>
          <button type="submit">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
