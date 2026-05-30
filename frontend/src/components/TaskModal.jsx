import { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const STAGES = [
  { value: 'todo',        label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
];

export default function TaskModal({ task, onClose }) {
  const isEditing = Boolean(task);
  const { addTask, editTask } = useTaskStore();

  const [title,       setTitle]       = useState(task?.title       ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [stage,       setStage]       = useState(task?.stage       ?? 'todo');
  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState({});
  const [apiError,    setApiError]    = useState('');

  const titleRef = useRef(null);

  // Focus title on open
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!title.trim())           errs.title = 'Title is required.';
    else if (title.trim().length > 120) errs.title = 'Title must be 120 characters or fewer.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');

    try {
      const payload = { title: title.trim(), description: description.trim() || null, stage };
      if (isEditing) {
        await editTask(task.id, payload);
      } else {
        await addTask(payload);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setApiError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem 0',
          }}
        >
          <h2
            id="modal-title"
            style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            id="modal-close-btn"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '0.35rem 0.5rem', fontSize: '1.1rem', color: 'var(--color-muted)' }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          id="task-form"
          onSubmit={handleSubmit}
          style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          noValidate
        >
          {apiError && <ErrorMessage message={apiError} />}

          {/* Title */}
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Title <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              className={`form-input${errors.title ? ' error' : ''}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="What needs to be done?"
              maxLength={120}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right' }}>
              {title.length}/120
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
              rows={3}
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </div>

          {/* Stage */}
          <div className="form-group">
            <label htmlFor="task-stage" className="form-label">Stage</label>
            <select
              id="task-stage"
              className="form-input"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" id="modal-cancel-btn" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 90 }}
            >
              {submitting && <LoadingSpinner size={15} />}
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
