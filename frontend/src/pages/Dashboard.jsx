import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import Navbar from '../components/Navbar';
import StageColumn from '../components/StageColumn';
import TaskModal from '../components/TaskModal';

const STAGES = ['todo', 'in_progress', 'done'];

/** Global error toast */
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!message) return null;

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background: '#1c1c1a',
        color: '#fff',
        padding: '0.75rem 1.125rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: 500,
        zIndex: 100,
        maxWidth: 320,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
      }}
    >
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '0.875rem',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, isLoading, error, fetchTasks, clearError } = useTaskStore();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingTask, setEditingTask] = useState(null); // task object or null

  // Fetch tasks on mount
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openNewTask  = () => { setEditingTask(null); setModalOpen(true); };
  const openEditTask = useCallback((task) => { setEditingTask(task); setModalOpen(true); }, []);
  const closeModal   = () => { setModalOpen(false); setEditingTask(null); };

  // Group tasks by stage
  const byStage = STAGES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.stage === s);
    return acc;
  }, {});

  return (
    <>
      <Navbar onNewTask={openNewTask} />

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '1.75rem 1.5rem',
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--color-text)',
            }}
          >
            My Board
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
            {isLoading
              ? 'Loading your tasks…'
              : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
          </p>
        </div>

        {/* Kanban grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
          className="kanban-grid"
        >
          {STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              tasks={byStage[stage]}
              isLoading={isLoading}
              onEdit={openEditTask}
            />
          ))}
        </div>
      </main>

      {/* Task create/edit modal */}
      {modalOpen && (
        <TaskModal task={editingTask} onClose={closeModal} />
      )}

      {/* Error toast */}
      {error && (
        <Toast message={error} onDismiss={clearError} />
      )}

      {/* Responsive kanban CSS */}
      <style>{`
        @media (max-width: 640px) {
          .kanban-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
