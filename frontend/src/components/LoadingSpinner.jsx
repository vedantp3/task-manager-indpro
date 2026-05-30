export default function LoadingSpinner({ size = 18, dark = false }) {
  return (
    <span
      className={`spinner ${dark ? 'spinner-dark' : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
