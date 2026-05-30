const ICONS = {
  todo:        '📋',
  in_progress: '⚡',
  done:        '✅',
};

const MESSAGES = {
  todo:        'No tasks here yet. Add one to get started!',
  in_progress: 'Nothing in progress. Move a task here when you start.',
  done:        'Nothing completed yet. Keep going!',
};

export default function EmptyState({ stage }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '2.5rem 1rem',
        color: 'var(--color-muted)',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '2rem', lineHeight: 1 }}>{ICONS[stage]}</span>
      <p style={{ fontSize: '0.875rem', maxWidth: 180, lineHeight: 1.5 }}>
        {MESSAGES[stage]}
      </p>
    </div>
  );
}
