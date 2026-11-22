-- Simple key/value store for admin-managed application settings.
-- Secrets (e.g. the Groq API key) are stored encrypted, not plaintext.
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
