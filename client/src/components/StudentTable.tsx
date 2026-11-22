import { useEffect, useMemo, useRef, useState } from 'react';
import type { StudentAccount } from '@elitequest/shared';

type SortKey = 'display_name' | 'username' | 'student_number' | 'is_active' | 'created_at';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';
export type BulkAction = 'activate' | 'deactivate' | 'delete';

interface StudentTableProps {
  students: StudentAccount[];
  isAdvisor: boolean;
  onUpdate: (student: StudentAccount) => Promise<boolean>;
  onSetPassword: (id: number) => Promise<void>;
  onToggleActive: (student: StudentAccount) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBulkAction: (ids: number[], action: BulkAction) => Promise<boolean>;
}

function createdTime(value: string | Date): number {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export default function StudentTable({
  students,
  isAdvisor,
  onUpdate,
  onSetPassword,
  onToggleActive,
  onDelete,
  onBulkAction,
}: StudentTableProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'display_name',
    dir: 'asc',
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ username: '', display_name: '', student_number: '' });
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      if (statusFilter === 'active' && !student.is_active) return false;
      if (statusFilter === 'inactive' && student.is_active) return false;
      if (!needle) return true;
      return (
        student.display_name.toLowerCase().includes(needle) ||
        student.username.toLowerCase().includes(needle) ||
        (student.student_number ?? '').toLowerCase().includes(needle)
      );
    });
  }, [students, query, statusFilter]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === 'is_active') {
        return (Number(a.is_active) - Number(b.is_active)) * dir;
      }
      if (sort.key === 'created_at') {
        return (createdTime(a.created_at) - createdTime(b.created_at)) * dir;
      }
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      return av.localeCompare(bv) * dir;
    });
  }, [filtered, sort]);

  const visibleIds = sorted.map((student) => student.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected = visibleIds.some((id) => selected.has(id)) && !allVisibleSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  function toggleSort(key: SortKey): void {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  function sortIndicator(key: SortKey): string {
    if (sort.key !== key) return '';
    return sort.dir === 'asc' ? ' ▲' : ' ▼';
  }

  function toggleOne(id: number): void {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllVisible(): void {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  }

  async function runBulk(action: BulkAction): Promise<void> {
    const ok = await onBulkAction([...selected], action);
    if (ok) {
      setSelected(new Set());
    }
  }

  function startEdit(student: StudentAccount): void {
    setEditingId(student.id);
    setDraft({
      username: student.username,
      display_name: student.display_name,
      student_number: student.student_number ?? '',
    });
  }

  async function saveEdit(student: StudentAccount): Promise<void> {
    const ok = await onUpdate({
      ...student,
      username: draft.username.trim(),
      display_name: draft.display_name.trim(),
      student_number: draft.student_number.trim() || null,
    });
    if (ok) {
      setEditingId(null);
    }
  }

  return (
    <div>
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search name, username or student number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search students"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isAdvisor && selected.size > 0 && (
        <div className="bulk-bar">
          <strong>{selected.size} selected</strong>
          <button onClick={() => { void runBulk('activate'); }}>Activate</button>
          <button onClick={() => { void runBulk('deactivate'); }}>Deactivate</button>
          <button className="danger" onClick={() => { void runBulk('delete'); }}>
            Delete
          </button>
          <button className="secondary" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {isAdvisor && (
                <th>
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible students"
                  />
                </th>
              )}
              <th className="sortable" onClick={() => toggleSort('display_name')}>
                Name{sortIndicator('display_name')}
              </th>
              <th className="sortable" onClick={() => toggleSort('username')}>
                Username{sortIndicator('username')}
              </th>
              <th className="sortable" onClick={() => toggleSort('student_number')}>
                Student No.{sortIndicator('student_number')}
              </th>
              <th className="sortable" onClick={() => toggleSort('is_active')}>
                Status{sortIndicator('is_active')}
              </th>
              <th className="sortable" onClick={() => toggleSort('created_at')}>
                Created{sortIndicator('created_at')}
              </th>
              {isAdvisor && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((student) => (
              <tr key={student.id}>
                {isAdvisor && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(student.id)}
                      onChange={() => toggleOne(student.id)}
                      aria-label={`Select ${student.display_name}`}
                    />
                  </td>
                )}
                {editingId === student.id ? (
                  <>
                    <td>
                      <input
                        value={draft.display_name}
                        onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
                        aria-label="Display name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        value={draft.username}
                        onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                        aria-label="Username"
                        required
                      />
                    </td>
                    <td>
                      <input
                        value={draft.student_number}
                        onChange={(e) => setDraft({ ...draft, student_number: e.target.value })}
                        aria-label="Student number"
                      />
                    </td>
                    <td>{student.is_active ? 'active' : 'inactive'}</td>
                    <td>{formatDate(student.created_at)}</td>
                    {isAdvisor && (
                      <td>
                        <div className="table-actions">
                          <button className="success" onClick={() => { void saveEdit(student); }}>
                            Save
                          </button>
                          <button className="secondary" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                ) : (
                  <>
                    <td>
                      <strong>{student.display_name}</strong>
                    </td>
                    <td>@{student.username}</td>
                    <td>{student.student_number ?? '—'}</td>
                    <td>
                      {student.is_active ? (
                        'active'
                      ) : (
                        <span className="badge badge-draft">inactive</span>
                      )}
                    </td>
                    <td>{formatDate(student.created_at)}</td>
                    {isAdvisor && (
                      <td>
                        <div className="table-actions">
                          <button onClick={() => startEdit(student)}>Edit</button>
                          <button onClick={() => { void onSetPassword(student.id); }}>
                            Set Password
                          </button>
                          <button onClick={() => { void onToggleActive(student); }}>
                            {student.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="secondary" onClick={() => { void onDelete(student.id); }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length > 0 && sorted.length === 0 && (
        <p style={{ color: 'var(--color-muted)' }}>No students match your search or filters.</p>
      )}
    </div>
  );
}
