import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { BloomLevel, CandidateQuestion } from '@elitequest/shared';
import {
  extractMaterial,
  generateQuestions,
  listAiModels,
} from '../api/ai.js';
import {
  buildMaterialText,
  MATERIAL_TEXT_LIMIT,
  PASTED_NOTES_NAME,
} from '../lib/materialText.js';
import type { MaterialSource, SectionReport } from '../lib/materialText.js';
import { createQuestion } from '../api/quizzes.js';
import { createBankQuestion } from '../api/question-banks.js';
import {
  useQuestionEditor,
  QuestionTypeFields,
  BloomLevelSelect,
  QUESTION_TYPES,
  BLOOM_LEVELS,
} from '../components/questionEditors.js';

const BLOOM_LABELS = new Map(BLOOM_LEVELS.map((l) => [l.value, l.label]));
const TYPE_LABELS = new Map(QUESTION_TYPES.map((t) => [t.value, t.label]));

type UploadedMaterial = {
  id: number;
  name: string;
  status: 'extracting' | 'ready' | 'error';
  text: string;
  // The server capped this single file during extraction.
  truncated: boolean;
  error?: string;
};

export default function AiGeneratePage(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const quizId = params.get('quiz') ? Number(params.get('quiz')) : null;
  const bankId = params.get('bank') ? Number(params.get('bank')) : null;

  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);
  const [manualText, setManualText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [bloomLevels, setBloomLevels] = useState<BloomLevel[]>([]);
  const [count, setCount] = useState(5);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');

  const [candidates, setCandidates] = useState<CandidateQuestion[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextMaterialIdRef = useRef(1);

  useEffect(() => {
    listAiModels()
      .then(setModels)
      .catch(() => setModels([]));
  }, []);

  const readyMaterials = useMemo(
    () => materials.filter((m) => m.status === 'ready'),
    [materials]
  );

  // Pure function of current state — badges and warnings can never go stale.
  const mergeResult = useMemo(() => {
    const sources: MaterialSource[] = readyMaterials.map((m) => ({
      name: m.name,
      text: m.text,
    }));
    if (manualText.trim().length > 0) {
      sources.push({ name: PASTED_NOTES_NAME, text: manualText });
    }
    return buildMaterialText(sources);
  }, [readyMaterials, manualText]);

  const sectionByMaterialId = useMemo(() => {
    const map = new Map<number, SectionReport>();
    mergeResult.sections.forEach((section, index) => {
      const material = readyMaterials[index];
      if (material) {
        map.set(material.id, section);
      }
    });
    return map;
  }, [mergeResult, readyMaterials]);

  function hasUnsaved(): boolean {
    return candidates.length > 0;
  }

  async function handleFilesSelected(files: File[]) {
    setError(null);
    const added: UploadedMaterial[] = files.map((file) => ({
      id: nextMaterialIdRef.current++,
      name: file.name,
      status: 'extracting',
      text: '',
      truncated: false,
    }));
    setMaterials((prev) => [...prev, ...added]);

    for (let i = 0; i < files.length; i++) {
      const id = added[i].id;
      try {
        const result = await extractMaterial(files[i].name, files[i]);
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: 'ready', text: result.text, truncated: result.truncated }
              : m
          )
        );
      } catch (err) {
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Could not read the file',
                }
              : m
          )
        );
      }
    }
  }

  function removeMaterial(id: number) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setWarning(null);
    setGenerating(true);
    try {
      const result = await generateQuestions({
        material_text: mergeResult.text,
        prompt: prompt.trim() ? prompt.trim() : undefined,
        count,
        bloom_levels: bloomLevels.length > 0 ? bloomLevels : undefined,
        model: model || undefined,
      });
      setCandidates(result.questions);
      setWarning(result.warning ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  function discardCandidate(index: number) {
    setCandidates(candidates.filter((_, i) => i !== index));
  }

  function updateCandidate(index: number, next: CandidateQuestion) {
    setCandidates(candidates.map((c, i) => (i === index ? next : c)));
  }

  async function handleSaveAll() {
    if (candidates.length === 0) return;
    setError(null);
    setSaving(true);
    let saved = 0;
    let failed = 0;
    for (const candidate of candidates) {
      const body = {
        type: candidate.type,
        prompt: candidate.prompt,
        data: candidate.data,
        answer_mode: candidate.answer_mode,
        points: candidate.points,
        bloom_level: candidate.bloom_level,
      };
      try {
        if (quizId !== null) {
          await createQuestion(quizId, { quiz_id: quizId, order_index: 0, ...body });
        } else if (bankId !== null) {
          await createBankQuestion(bankId, body);
        } else {
          break;
        }
        saved += 1;
      } catch {
        failed += 1;
      }
    }
    setSaving(false);
    if (failed === 0) {
      navigate(quizId !== null ? `/quizzes/${quizId}/edit` : `/banks/${bankId}`);
      return;
    }
    setError(
      `Saved ${saved} question(s); ${failed} failed (possibly duplicates). The remaining ones are still listed.`
    );
    setCandidates(candidates.slice(saved));
  }

  return (
    <div>
      <p>
        <Link
          to={quizId !== null ? `/quizzes/${quizId}/edit` : '/banks'}
          onClick={(e) => {
            if (hasUnsaved() && !confirm('Discard the generated questions?')) {
              e.preventDefault();
            }
          }}
        >
          &larr; Back
        </Link>
      </p>
      <h2>Generate Questions with AI</h2>
      {error && <p className="error">{error}</p>}
      {warning && <p className="error">{warning}</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>1. Study material</h3>
        <p style={{ color: 'var(--color-muted)' }}>
          Upload one or more files as reference material — any text or
          source-code file (.txt, .md, .py, .dart, …) plus .pdf, .docx, .pptx
          and .xlsx — and/or paste text below. Material is read in memory to
          build the questions and is never stored.
        </p>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) void handleFilesSelected(files);
            e.target.value = '';
          }}
        />
        {materials.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {materials.map((material) => {
              const section = sectionByMaterialId.get(material.id);
              return (
                <li
                  key={material.id}
                  className="row-between"
                  style={{ flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  <div>
                    {material.status === 'extracting' && (
                      <span>Extracting {material.name}…</span>
                    )}
                    {material.status === 'error' && (
                      <span className="error">
                        {material.name}: {material.error}
                      </span>
                    )}
                    {material.status === 'ready' && (
                      <>
                        <strong>{material.name}</strong>{' '}
                        <span style={{ color: 'var(--color-muted)' }}>
                          {material.text.length.toLocaleString()} chars
                          {material.truncated ? ' (capped at 100,000 on extraction)' : ''}
                        </span>{' '}
                        {section?.status === 'complete' && (
                          <span className="badge badge-open">Fully included</span>
                        )}
                        {section?.status === 'truncated' && (
                          <span className="badge badge-draft">Partially included</span>
                        )}
                        {section?.status === 'not-included' && (
                          <span className="badge badge-closed">Not included</span>
                        )}
                      </>
                    )}
                  </div>
                  {material.status !== 'extracting' && (
                    <button type="button" onClick={() => removeMaterial(material.id)}>
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <label>Pasted notes (optional)</label>
        <textarea
          rows={8}
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Paste extra lecture notes, a chapter, slides text…"
          maxLength={MATERIAL_TEXT_LIMIT}
        />
        {mergeResult.sections.some((s) => s.status !== 'complete') && (
          <div>
            <p className="warning">
              Material exceeds the {MATERIAL_TEXT_LIMIT.toLocaleString()}-character
              limit — content was trimmed before sending:
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {mergeResult.sections.map((section, index) => {
                if (section.status === 'complete') return null;
                return (
                  <li key={`${section.name}-${index}`} style={{ marginBottom: '0.5rem' }}>
                    {section.status === 'truncated' && (
                      <>
                        <strong>{section.name}</strong> — included{' '}
                        {section.includedChars.toLocaleString()} of{' '}
                        {section.totalChars.toLocaleString()} chars. Cut off after:
                        {section.lastIncludedSentences.length > 0 && (
                          <blockquote
                            style={{
                              margin: '0.25rem 0 0 1rem',
                              color: 'var(--color-muted)',
                            }}
                          >
                            “…{section.lastIncludedSentences.join(' ')}”
                          </blockquote>
                        )}
                      </>
                    )}
                    {section.status === 'not-included' && (
                      <>
                        <strong>{section.name}</strong> — not included (character
                        budget exhausted)
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>2. Options</h3>
        <form onSubmit={(e) => { void handleGenerate(e); }}>
          <label>Additional instructions (optional)</label>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={2000}
            placeholder="e.g. focus on chapter 3 terminology, avoid yes/no questions"
          />

          <label>Bloom&apos;s level(s) — none selected lets the AI decide</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {BLOOM_LEVELS.map((level) => (
              <label key={level.value}>
                <input
                  type="checkbox"
                  checked={bloomLevels.includes(level.value)}
                  onChange={(e) =>
                    setBloomLevels(
                      e.target.checked
                        ? [...bloomLevels, level.value]
                        : bloomLevels.filter((b) => b !== level.value)
                    )
                  }
                  style={{ width: 'auto' }}
                />
                {level.label}
              </label>
            ))}
          </div>

          <label>How many questions (1–20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />

          {models.length > 0 && (
            <>
              <label>Model (default from AI Settings)</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="">Use default</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </>
          )}
          {models.length === 0 && (
            <p style={{ color: 'var(--color-muted)' }}>
              No AI models available — an admin must set the Groq API key under{' '}
              <strong>Dashboard &rarr; AI Settings</strong>.
            </p>
          )}

          <button
            type="submit"
            disabled={generating || mergeResult.text.trim().length === 0}
          >
            {generating ? 'Generating…' : 'Generate Questions'}
          </button>
        </form>
      </div>

      {candidates.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            3. Review ({candidates.length}) — nothing is saved until you approve
          </h3>
          <button onClick={() => void handleSaveAll()} disabled={saving}>
            {saving ? 'Saving…' : `Save All (${candidates.length})`}
          </button>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={`${index}-${candidate.prompt.slice(0, 24)}`}
                candidate={candidate}
                onDiscard={() => discardCandidate(index)}
                onUpdate={(next) => updateCandidate(index, next)}
              />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  onDiscard,
  onUpdate,
}: {
  candidate: CandidateQuestion;
  onDiscard: () => void;
  onUpdate: (next: CandidateQuestion) => void;
}): JSX.Element {
  const [editing, setEditing] = useState(false);
  const qe = useQuestionEditor();

  function startEditing() {
    // Populate the shared editor with a Question-shaped view of the candidate.
    qe.populate({
      id: -1,
      order_index: 0,
      type: candidate.type,
      prompt: candidate.prompt,
      data: candidate.data,
      answer_mode: candidate.answer_mode,
      points: candidate.points,
      time_limit_seconds: null,
      bloom_level: candidate.bloom_level,
      created_at: new Date(),
    });
    setEditing(true);
  }

  function applyEdits() {
    onUpdate({
      type: qe.type,
      prompt: qe.prompt,
      data: qe.buildData(),
      answer_mode: candidate.answer_mode,
      points: candidate.points,
      bloom_level: qe.bloomLevel === '' ? candidate.bloom_level : qe.bloomLevel,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="card">
        <QuestionTypeFields editor={qe} />
        <BloomLevelSelect value={qe.bloomLevel} onChange={qe.setBloomLevel} />
        <button type="button" onClick={applyEdits}>
          Done
        </button>
      </li>
    );
  }

  return (
    <li className="card">
      <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="badge badge-open">{TYPE_LABELS.get(candidate.type) ?? candidate.type}</span>{' '}
          <span className="badge badge-draft">
            Bloom: {BLOOM_LABELS.get(candidate.bloom_level) ?? candidate.bloom_level}
          </span>{' '}
          <span style={{ color: 'var(--color-muted)' }}>{candidate.points} pts</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={startEditing}>
            Edit
          </button>
          <button type="button" className="secondary" onClick={onDiscard}>
            Discard
          </button>
        </div>
      </div>
      <p style={{ marginBottom: 0 }}>{candidate.prompt}</p>
    </li>
  );
}
