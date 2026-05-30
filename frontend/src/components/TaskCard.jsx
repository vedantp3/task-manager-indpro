import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import LoadingSpinner from './LoadingSpinner';

const STAGE_LABEL = {
  todo:        'Todo',
  in_progress: 'In Progress',
  done:        'Done',
};

export default function TaskCard({ task, onEdit }) {
  const { removeTask } = useTaskStore();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeTask(task.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <article
      className="card"
      style={{
        padding: '0.875rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'box-shadow var(--transition)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = 'var(--shadow-card)')
      }
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h3
          style={{
            flex: 1,
            fontSize: '0.9375rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: 'var(--color-text)',
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </h3>

        {/* Action buttons */}
        {!confirming && (
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button
              id={`edit-task-${task.id}`}
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(task)}
              title="Edit task"
              style={{ padding: '0.3rem 0.5rem', color: 'var(--color-muted)' }}
            >
              ✏️
            </button>
            <button
              id={`delete-task-${task.id}`}
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(true)}
              title="Delete task"
              style={{ padding: '0.3rem 0.5rem', color: 'var(--color-muted)' }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-muted)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Footer: badge + confirmation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.125rem',
        }}
      >
        <span className={`badge badge-${task.stage}`}>
          {STAGE_LABEL[task.stage]}
        </span>

        {confirming && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>
              Delete?
            </span>
            <button
              id={`confirm-delete-${task.id}`}
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {deleting && <LoadingSpinner size={12} />}
              Yes
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
