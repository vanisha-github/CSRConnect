export default function StatusBadge({ status }) {
  const styles = {
    pending: 'badge-yellow',
    active: 'badge-blue',
    in_progress: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
    verified: 'badge-green',
    rejected: 'badge-red',
    true: 'badge-green',
    false: 'badge-red',
  };

  const labels = {
    pending: 'Pending',
    active: 'Active',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    verified: 'Verified',
    rejected: 'Rejected',
    true: 'Verified',
    false: 'Unverified',
  };

  const key = String(status).toLowerCase();
  return (
    <span className={styles[key] || 'badge-blue'}>
      {labels[key] || status}
    </span>
  );
}
