import React, { useState, useRef, useCallback } from 'react';
import { uploadAsset } from '../utils/api';
import { formatFileSize } from '../utils/helpers';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
  'application/pdf',
  'video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
];

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `Unsupported file type: ${f.type}. Only images, PDFs, and videos are allowed.`;
    }
    if (f.size > 100 * 1024 * 1024) {
      return `File too large: ${formatFileSize(f.size)}. Max size is 100MB.`;
    }
    return null;
  };

  const handleFileSelect = (f) => {
    setError('');
    setSuccess('');
    setProgress(0);
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', tags);

    try {
      const res = await uploadAsset(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      setSuccess(`✅ "${res.data.asset.originalName}" uploaded successfully!`);
      setFile(null);
      setTags('');
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess(res.data.asset);
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setError(`❌ ${msg}`);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {file ? (
          <div className="file-preview-info">
            <div className="file-icon-large">
              {file.type.startsWith('image/') ? '🖼️' : file.type === 'application/pdf' ? '📄' : '🎬'}
            </div>
            <div className="file-meta">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); setSuccess(''); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-prompt">
            <div className="drop-icon">⬆</div>
            <p className="drop-title">Drop file here or click to browse</p>
            <p className="drop-sub">Images · PDFs · Videos — Max 100MB</p>
          </div>
        )}
      </div>

      {file && (
        <div className="upload-controls">
          <input
            type="text"
            className="tags-input"
            placeholder="Add tags (comma-separated): design, branding, 2024"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={uploading}
          />

          {uploading && (
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <span className="progress-label">{progress}%</span>
            </div>
          )}

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading… ${progress}%` : 'Upload Asset'}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </div>
  );
};

export default UploadZone;
