import React from 'react';

const Filters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <input
          type="text"
          className="filter-input search-input"
          placeholder="🔍  Search by name or tag…"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.fileType}
          onChange={(e) => handleChange('fileType', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="pdf">PDFs</option>
          <option value="video">Videos</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="filter-group date-range">
        <label>From</label>
        <input
          type="date"
          className="filter-input"
          value={filters.dateFrom}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
        />
        <label>To</label>
        <input
          type="date"
          className="filter-input"
          value={filters.dateTo}
          onChange={(e) => handleChange('dateTo', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="uploadedAt">Sort: Date</option>
          <option value="originalName">Sort: Name</option>
          <option value="size">Sort: Size</option>
        </select>
        <button
          className="sort-toggle"
          onClick={() => handleChange('order', filters.order === 'desc' ? 'asc' : 'desc')}
          title="Toggle sort order"
        >
          {filters.order === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      <button
        className="clear-filters-btn"
        onClick={() =>
          onChange({ search: '', fileType: 'all', dateFrom: '', dateTo: '', sortBy: 'uploadedAt', order: 'desc' })
        }
      >
        Reset
      </button>
    </div>
  );
};

export default Filters;
