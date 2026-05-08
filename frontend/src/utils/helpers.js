export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFileTypeIcon = (fileType) => {
  const icons = {
    image: '🖼️',
    pdf: '📄',
    video: '🎬',
    other: '📁',
  };
  return icons[fileType] || '📁';
};

export const getFileTypeColor = (fileType) => {
  const colors = {
    image: '#4ade80',
    pdf: '#f87171',
    video: '#a78bfa',
    other: '#94a3b8',
  };
  return colors[fileType] || '#94a3b8';
};

export const isPreviewable = (fileType, mimeType) => {
  if (fileType === 'image') return true;
  if (fileType === 'video') return true;
  if (mimeType === 'application/pdf') return true;
  return false;
};
