import React, { useState, useEffect, useCallback } from 'react';
import { getAssets } from '../utils/api';
import AssetCard from './AssetCard';
import Filters from './Filters';

const Gallery = ({ refreshTrigger }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    fileType: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'uploadedAt',
    order: 'desc',
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: filters.search || undefined,
        fileType: filters.fileType !== 'all' ? filters.fileType : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy: filters.sortBy,
        order: filters.order,
      };
      const res = await getAssets(params);
      setAssets(res.data.assets);
    } catch {
      setError('Failed to load assets. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [filters, refreshTrigger]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchAssets(), 300);
    return () => clearTimeout(debounce);
  }, [fetchAssets]);

  const handleDelete = (id) => {
    setAssets((prev) => prev.filter((a) => a._id !== id));
  };

  const handleTagsUpdate = (updatedAsset) => {
    setAssets((prev) => prev.map((a) => (a._id === updatedAsset._id ? updatedAsset : a)));
  };

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h2 className="gallery-title">
          Assets
          {!loading && <span className="asset-count">{assets.length}</span>}
        </h2>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ⊞
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading assets…</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-error">{error}</div>
      )}

      {!loading && !error && assets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-title">No assets found</p>
          <p className="empty-sub">
            {filters.search || filters.fileType !== 'all' || filters.dateFrom || filters.dateTo
              ? 'Try changing your filters.'
              : 'Upload your first asset above.'}
          </p>
        </div>
      )}

      {!loading && !error && assets.length > 0 && (
        <div className={viewMode === 'grid' ? 'asset-grid' : 'asset-list'}>
          {assets.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              viewMode={viewMode}
              onDelete={handleDelete}
              onTagsUpdate={handleTagsUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
