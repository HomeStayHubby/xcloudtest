import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Quiz, QuizDetail, Question } from '@elitequest/shared';
import {
  getQuiz,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateQuiz,
  releaseQuiz,
  unreleaseQuiz,
  listGroups,
  createGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  copyQuestionFromBank,
  type GroupWithMembers,
} from '../api/quizzes.js';
import { listClasses, listStudents, type ClassSummary, type StudentAccount } from '../api/classes.js';
import { listBanks, listBankQuestions, type QuestionBankDetail } from '../api/question-banks.js';
import { useQuestionEditor, QuestionTypeFields, BloomLevelSelect } from '../components/questionEditors.js';
import { MarkdownText } from '../components/MarkdownText.js';

export default function QuizEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [settings, setSettings] = useState<Quiz['settings']>({
    randomize_questions: false,
    show_answers: true,
    reveal_answers_in_summary: true,
    default_answer_mode: 'individual',
    paced: false,
    sprint: false,
    sprint_bonus_pct: 0.25,
  });
  const [questionTimeLimit, setQuestionTimeLimit] = useState<string>('');

  // Releases + quiz groups state
  const [releaseClassId, setReleaseClassId] = useState('');
  const [quizGroups, setQuizGroups] = useState<GroupWithMembers[]>([]);
  const [quizGroupName, setQuizGroupName] = useState('');
  const [banks, setBanks] = useState<QuestionBankDetail[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');

  // New/edit question state
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [points, setPoints] = useState(1);
  const [answerMode, setAnswerMode] = useState<'individual' | 'group'>('individual');
  const qe = useQuestionEditor();

  useEffect(() => {
    loadData();
  }, [quizId]);

  async function loadData() {
    setError(null);
    try {
      const [q, qs, cs, gs, bs] = await Promise.all([
        getQuiz(quizId),
        listQuestions(quizId),
        listClasses(),
        listGroups(quizId).catch(() => []),
        listBanks().catch(() => []),
      ]);
      setQuiz(q);
      setQuizTitle(q.title);
      setSettings(q.settings);
      setQuestions(qs);
      setClasses(cs);
      setQuizGroups(gs);
      setBanks(bs);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setLoading(false);
    }
  }

  async function loadBankQuestions(bankId: string) {
    setSelectedBankId(bankId);
    if (!bankId) {
      setBankQuestions([]);
      return;
    }
    try {
      setBankQuestions(await listBankQuestions(Number(bankId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bank questions');
    }
  }

  function resetForm() {
    setEditingQuestionId(null);
    setPoints(1);
    setAnswerMode(settings.default_answer_mode);
    setQuestionTimeLimit('');
    qe.reset();
  }

  function populateForm(question: Question) {
    setEditingQuestionId(question.id);
    setPoints(question.points);
    setAnswerMode(question.answer_mode);
    setQuestionTimeLimit(question.time_limit_seconds?.toString() ?? '');
    qe.populate(question);
  }

  async function handleSaveQuestion(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const body = {
        quiz_id: quizId,
        order_index: 0,
        type: qe.type,
        prompt: qe.prompt,
        data: qe.buildData(),
        answer_mode: answerMode,
        points,
        time_limit_seconds: questionTimeLimit ? Number(questionTimeLimit) : null,
        bloom_level: qe.bloomLevel === '' ? null : qe.bloomLevel,
      };
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, body);
      } else {
        await createQuestion(quizId, body);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuestion(questionId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  }

  async function handleUpdateQuizSettings(event: FormEvent) {
    event.preventDefault();
    if (!quiz) return;
    try {
      await updateQuiz(quiz.id, {
        title: quizTitle,
        settings,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quiz');
    }
  }

  async function handleRelease(event: FormEvent) {
    event.preventDefault();
    if (!quiz || !releaseClassId) return;
    setError(null);
    try {
      await releaseQuiz(quiz.id, Number(releaseClassId));
      setReleaseClassId('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release quiz');
    }
  }

  async function handleUnrelease(classId: number) {
    if (!quiz) return;
    setError(null);
    try {
      await unreleaseQuiz(quiz.id, classId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove release');
    }
  }

  async function handleCreateQuizGroup(event: FormEvent) {
    event.preventDefault();
    if (!quiz) return;
    setError(null);
    try {
      await createGroup(quiz.id, { name: quizGroupName });
      setQuizGroupName('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  }

  async function handleDeleteQuizGroup(groupId: number) {
    if (!confirm('Delete this group?')) return;
    try {
      await deleteGroup(groupId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  }

  async function handleAssignMember(groupId: number, studentIdToAssign: string) {
    if (!studentIdToAssign) return;
    setError(null);
    try {
      await addGroupMember(groupId, Number(studentIdToAssign));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  }

  async function handleRemoveMember(groupId: number, memberId: number) {
    try {
      await removeGroupMember(groupId, memberId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }

  async function handleCopyBankQuestion(bankId: string, questionId: number) {
    if (!quiz) return;
    setError(null);
    try {
      await copyQuestionFromBank(quiz.id, Number(bankId), questionId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy question');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!quiz) return <p>Quiz not found.</p>;

  return (
    <div>
      <p>
        <Link to="/quizzes" className="button secondary">
          &larr; Back to quizzes
        </Link>{' '}
        <Link to={`/generate?quiz=${quizId}`} className="button">
          Generate with AI
        </Link>
      </p>
      <h2>Edit Quiz</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <form onSubmit={handleUpdateQuizSettings}>
          <label>Quiz Title</label>
          <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />

          <label>
            <input
              type="checkbox"
              checked={settings.randomize_questions}
              onChange={(e) => setSettings({ ...settings, randomize_questions: e.target.checked })}
            />
            Randomize question order
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.show_answers}
              onChange={(e) => setSettings({ ...settings, show_answers: e.target.checked })}
            />
            Show answers to students
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.reveal_answers_in_summary}
              onChange={(e) =>
                setSettings({ ...settings, reveal_answers_in_summary: e.target.checked })
              }
            />
            Reveal correct answers in the student summary screen
          </label>

          <label>Quiz time limit (seconds, optional)</label>
          <input
            type="number"
            min={1}
            value={settings.time_limit_seconds ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                time_limit_seconds: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />

          <label>Default answer mode</label>
          <select
            value={settings.default_answer_mode}
            onChange={(e) =>
              setSettings({
                ...settings,
                default_answer_mode: e.target.value as 'individual' | 'group',
              })
            }
          >
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={settings.paced}
              onChange={(e) => setSettings({ ...settings, paced: e.target.checked })}
            />
            Instructor-paced (students follow your controls)
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.sprint}
              onChange={(e) => setSettings({ ...settings, sprint: e.target.checked })}
            />
            Sprint mode (timed questions award speed bonuses)
          </label>
          {settings.sprint && (
            <>
              <label>Sprint bonus multiplier (0–2)</label>
              <input
                type="number"
                min={0}
                max={2}
                step={0.05}
                value={settings.sprint_bonus_pct}
                onChange={(e) =>
                  setSettings({ ...settings, sprint_bonus_pct: Number(e.target.value) })
                }
              />
            </>
          )}
          <button type="submit">Save Settings</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Released Classes</h3>
        <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>
          Students of a released class see this quiz while it is open — you can release it
          to any class you teach.
        </p>
        <form onSubmit={handleRelease} className="inline-form">
          <select value={releaseClassId} onChange={(e) => setReleaseClassId(e.target.value)} required>
            <option value="">Choose class to release to…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <button type="submit">Release</button>
        </form>
        {(quiz?.releases ?? []).length === 0 ? (
          <p>No releases yet — students cannot see this quiz.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(quiz?.releases ?? []).map((release) => (
              <li key={release.id} className="row-between" style={{ padding: '0.4rem 0' }}>
                <span>
                  {release.class_name ?? `Class #${release.class_id}`}
                </span>
                <button onClick={() => void handleUnrelease(release.class_id)} className="secondary">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Quiz Groups</h3>
        <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>
          Groups are for group-answered questions in this quiz. Pick students from any
          released class.
        </p>
        <form onSubmit={handleCreateQuizGroup} className="inline-form">
          <input
            placeholder="Group name"
            value={quizGroupName}
            onChange={(e) => setQuizGroupName(e.target.value)}
            required
          />
          <button type="submit">Add Group</button>
        </form>
        {quizGroups.length === 0 ? (
          <p>No groups for this quiz yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {quizGroups.map((group) => (
              <li key={group.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{group.name}</strong>
                  <button onClick={() => void handleDeleteQuizGroup(group.id)} className="secondary">
                    Delete
                  </button>
                </div>
                <p>
                  Members:{' '}
                  {group.members.length === 0
                    ? 'none'
                    : group.members.map((m) => m.display_name).join(', ')}
                </p>
                <GroupMemberPicker
                  group={group}
                  releaseClassIds={(quiz?.releases ?? []).map((r) => r.class_id)}
                  onAssign={handleAssignMember}
                  onRemove={handleRemoveMember}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {banks.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add Question from Bank</h3>
          <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>
            Bank questions are snapshot-copied into this quiz — later bank edits won't
            change the quiz.
          </p>
          <select value={selectedBankId} onChange={(e) => void loadBankQuestions(e.target.value)}>
            <option value="">Choose a bank…</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.title} ({bank.question_count ?? 0} questions)
              </option>
            ))}
          </select>
          {selectedBankId && bankQuestions.length === 0 && <p>This bank has no questions yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {bankQuestions.map((question) => (
              <li key={question.id} className="row-between" style={{ padding: '0.4rem 0' }}>
                <span>
                  [{question.type}] <MarkdownText tag="span" text={question.prompt} />
                </span>
                <button onClick={() => void handleCopyBankQuestion(selectedBankId, question.id)}>
                  Copy to Quiz
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
        <form onSubmit={handleSaveQuestion}>
          <QuestionTypeFields editor={qe} />
          <BloomLevelSelect value={qe.bloomLevel} onChange={qe.setBloomLevel} />

          <label>Points</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />

          <label>Answer Mode</label>
          <select
            value={answerMode}
            onChange={(e) => setAnswerMode(e.target.value as 'individual' | 'group')}
          >
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>

          <label>Question time limit (seconds, optional)</label>
          <input
            type="number"
            min={1}
            value={questionTimeLimit}
            onChange={(e) => setQuestionTimeLimit(e.target.value)}
          />

          <button type="submit">{editingQuestionId ? 'Update Question' : 'Add Question'}</button>
          {editingQuestionId && (
            <button type="button" onClick={resetForm} className="secondary" style={{ marginLeft: '0.5rem' }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <h3>Questions ({questions.length})</h3>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((q, index) => (
            <li key={q.id} className="card">
              <strong>
                {index + 1}. [{q.type}] <MarkdownText tag="span" text={q.prompt} />
              </strong>
              <p>
                Points: {q.points} | Mode: {q.answer_mode}
                {q.time_limit_seconds ? ` | Timer: ${q.time_limit_seconds}s` : ''}
              </p>
              <button onClick={() => populateForm(q)}>Edit</button>
              <button onClick={() => handleDeleteQuestion(q.id)} className="secondary">
                Delete
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function GroupMemberPicker({
  group,
  releaseClassIds,
  onAssign,
  onRemove,
}: {
  group: GroupWithMembers;
  releaseClassIds: number[];
  onAssign: (groupId: number, studentId: string) => Promise<void>;
  onRemove: (groupId: number, memberId: number) => Promise<void>;
}): JSX.Element {
  const [students, setStudents] = useState<StudentAccount[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(releaseClassIds.map((classId) => listStudents(classId).catch(() => [])))
      .then((rosters) => {
        if (cancelled) return;
        const seen = new Set<number>();
        const merged: StudentAccount[] = [];
        for (const roster of rosters) {
          for (const student of roster) {
            if (!seen.has(student.id)) {
              seen.add(student.id);
              merged.push(student);
            }
          }
        }
        setStudents(merged);
      });
    return () => {
      cancelled = true;
    };
  }, [releaseClassIds.join(',')]);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <select
        defaultValue=""
        onChange={(e) => {
          void onAssign(group.id, e.target.value);
          e.target.value = '';
        }}
      >
        <option value="">Assign student�</option>
        {students
          .filter((s) => !group.members.some((m) => m.id === s.id))
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.display_name} (@{s.username})
            </option>
          ))}
      </select>
      {group.members.map((m) => (
        <button key={m.id} onClick={() => void onRemove(group.id, m.id)}>
          Remove {m.display_name}
        </button>
      ))}
    </div>
  );
}
