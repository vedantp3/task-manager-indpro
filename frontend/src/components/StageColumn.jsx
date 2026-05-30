import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

const STAGE_CONFIG = {
  todo:        { label: 'Todo',        color: '#6b7280' },
  in_progress: { label: 'In Progress', color: '#d97706' },
  done:        { label: 'Done',        color: '#059669' },
};

/** Skeleton card shown while loading */
function SkeletonCard() {
  return (
    <div
      className="card"
      style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
    >
      <div className="skeleton" style={{ height: 16, width: '75%' }} />
      <div className="skeleton" style={{ height: 12, width: '55%' }} />
      <div className="skeleton" style={{ height: 20, width: 56, borderRadius: 99 }} />
    </div>
  );
}

export default function StageColumn({ stage, tasks, isLoading, onEdit }) {
  const config = STAGE_CONFIG[stage];

  return (
    <section
      style={{
        background: '#f9f9f8',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
        overflow: 'hidden',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--color-surface)',
        }}
      >
        {/* Stage color dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: config.color,
            flexShrink: 0,
          }}
        />

        <h2
          style={{
            flex: 1,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            letterSpacing: '-0.005em',
          }}
        >
          {config.label}
        </h2>

        {/* Task count badge */}
        <span
          style={{
            background: '#f3f4f6',
            color: 'var(--color-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '1px 7px',
            borderRadius: 99,
          }}
        >
          {isLoading ? '—' : tasks.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        style={{
          flex: 1,
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          overflowY: 'auto',
        }}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : tasks.length === 0 ? (
          <EmptyState stage={stage} />
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </div>
    </section>
  );
}
