export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-sm)',
        padding: '0.625rem 0.875rem',
        color: 'var(--color-danger)',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}
