import React, { useState } from 'react';
import { formatFileSize, formatDate, getFileTypeIcon, getFileTypeColor } from '../utils/helpers';
import { getDownloadUrl, deleteAsset, updateTags } from '../utils/api';

const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AssetCard = ({ asset, viewMode, onDelete, onTagsUpdate }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState(asset.tags.join(', '));
  const [deleting, setDeleting] = useState(false);

  const previewUrl = `${BACKEND_URL}/uploads/${asset.storedName}`;
  const typeColor = getFileTypeColor(asset.fileType);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${asset.originalName}"?`)) return;
    setDeleting(true);
    try {
      await deleteAsset(asset._id);
      onDelete(asset._id);
    } catch {
      alert('Failed to delete asset.');
      setDeleting(false);
    }
  };

  const handleSaveTags = async () => {
    const newTags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    try {
      const res = await updateTags(asset._id, newTags);
      onTagsUpdate(res.data);
      setEditingTags(false);
    } catch {
      alert('Failed to update tags.');
    }
  };

  const renderPreview = () => {
    if (asset.fileType === 'image') {
      return <img src={previewUrl} alt={asset.originalName} className="asset-thumb" />;
    }
    if (asset.fileType === 'video') {
      return (
        <div className="asset-thumb video-thumb">
          <span className="thumb-icon">🎬</span>
          <span className="thumb-label">Video</span>
        </div>
      );
    }
    if (asset.fileType === 'pdf') {
      return (
        <div className="asset-thumb pdf-thumb">
          <span className="thumb-icon">📄</span>
          <span className="thumb-label">PDF</span>
        </div>
      );
    }
    return (
      <div className="asset-thumb generic-thumb">
        <span className="thumb-icon">📁</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="asset-row">
        <div className="asset-row-thumb">{renderPreview()}</div>
        <div className="asset-row-info">
          <span className="asset-row-name" title={asset.originalName}>{asset.originalName}</span>
          <span className="asset-row-meta">
            <span className="type-badge" style={{ borderColor: typeColor, color: typeColor }}>
              {getFileTypeIcon(asset.fileType)} {asset.fileType}
            </span>
            <span>{formatFileSize(asset.size)}</span>
            <span>{formatDate(asset.uploadedAt)}</span>
          </span>
          {asset.tags.length > 0 && (
            <div className="tag-list">
              {asset.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
        <div className="asset-row-actions">
          <a href={getDownloadUrl(asset._id)} download className="action-btn dl-btn" title="Download">⬇</a>
          <button className="action-btn del-btn" onClick={handleDelete} disabled={deleting} title="Delete">🗑</button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <>
      <div className="asset-card">
        <div className="card-thumb" onClick={() => setShowPreview(true)}>
          {renderPreview()}
          <div className="card-thumb-overlay">
            <span>Preview</span>
          </div>
        </div>

        <div className="card-body">
          <p className="card-name" title={asset.originalName}>{asset.originalName}</p>
          <div className="card-meta">
            <span className="type-badge" style={{ borderColor: typeColor, color: typeColor }}>
              {getFileTypeIcon(asset.fileType)} {asset.fileType.toUpperCase()}
            </span>
            <span className="card-size">{formatFileSize(asset.size)}</span>
          </div>
          <p className="card-date">{formatDate(asset.uploadedAt)}</p>

          {editingTags ? (
            <div className="tag-edit">
              <input
                className="tag-edit-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="tag1, tag2"
              />
              <div className="tag-edit-actions">
                <button className="tag-save-btn" onClick={handleSaveTags}>Save</button>
                <button className="tag-cancel-btn" onClick={() => { setEditingTags(false); setTagInput(asset.tags.join(', ')); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="tag-list" onClick={() => setEditingTags(true)} title="Click to edit tags">
              {asset.tags.length > 0
                ? asset.tags.map((t) => <span key={t} className="tag">{t}</span>)
                : <span className="tag-empty">+ add tags</span>}
            </div>
          )}
        </div>

        <div className="card-actions">
          <a href={getDownloadUrl(asset._id)} download className="action-btn dl-btn" title="Download">
            ⬇ Download
          </a>
          <button className="action-btn del-btn" onClick={handleDelete} disabled={deleting} title="Delete">
            {deleting ? '…' : '🗑'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setShowPreview(false)}>✕</button>
            <p className="preview-name">{asset.originalName}</p>
            {asset.fileType === 'image' && (
              <img src={previewUrl} alt={asset.originalName} className="preview-img" />
            )}
            {asset.fileType === 'video' && (
              <video src={previewUrl} controls className="preview-video" />
            )}
            {asset.fileType === 'pdf' && (
              <iframe src={previewUrl} title={asset.originalName} className="preview-pdf" />
            )}
            {asset.fileType === 'other' && (
              <div className="preview-unsupported">
                <span>📁</span>
                <p>Preview not available for this file type.</p>
              </div>
            )}
            <a href={getDownloadUrl(asset._id)} download className="preview-download-btn">
              ⬇ Download
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetCard;
