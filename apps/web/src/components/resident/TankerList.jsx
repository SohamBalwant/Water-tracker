import React, { useState, useMemo } from 'react';
import { TankerCard } from './TankerCard.jsx';

export function TankerList({
  tankers = [],
  selectedTanker,
  onSelectTanker,
  onRequestTanker,
  isLoading,
}) {
  const [waterTypeFilter, setWaterTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('distance');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedTankers = useMemo(() => {
    let result = [...tankers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.displayName.toLowerCase().includes(q) ||
          (t.locality && t.locality.toLowerCase().includes(q))
      );
    }

    // Water type filter
    if (waterTypeFilter !== 'ALL') {
      result = result.filter((t) => t.waterType === waterTypeFilter);
    }

    // Status filter
    if (statusFilter === 'AVAILABLE') {
      result = result.filter((t) => t.status === 'AVAILABLE');
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      }
      if (sortBy === 'price_asc') {
        return a.pricePer1000Litres - b.pricePer1000Litres;
      }
      if (sortBy === 'capacity_desc') {
        return b.availableLitres - a.availableLitres;
      }
      return 0;
    });

    return result;
  }, [tankers, waterTypeFilter, statusFilter, sortBy, searchQuery]);

  return (
    <div className="tankers-panel">
      <div className="panel-header">
        <div className="panel-title-area">
          <h2>Nearby Water Tankers</h2>
          <p>
            {filteredAndSortedTankers.length} supplier
            {filteredAndSortedTankers.length === 1 ? '' : 's'} available in your vicinity
          </p>
        </div>

        <div style={{ minWidth: '200px' }}>
          <input
            type="search"
            className="form-input"
            style={{ padding: '7px 12px', fontSize: '0.85rem' }}
            placeholder="🔍 Search supplier or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter tankers by name or locality"
          />
        </div>
      </div>

      {/* Filters and Sorting Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${waterTypeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setWaterTypeFilter('ALL')}
          >
            All Water
          </button>
          <button
            type="button"
            className={`filter-pill ${waterTypeFilter === 'NON_DRINKING' ? 'active' : ''}`}
            onClick={() => setWaterTypeFilter('NON_DRINKING')}
          >
            Utility / Non-Drinking
          </button>
          <button
            type="button"
            className={`filter-pill ${waterTypeFilter === 'DRINKING' ? 'active' : ''}`}
            onClick={() => setWaterTypeFilter('DRINKING')}
          >
            Drinking / Potable
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          >
            {statusFilter === 'AVAILABLE' ? '✓ Available Only' : 'Available Only'}
          </button>
        </div>

        <div className="sort-select-wrapper">
          <label htmlFor="tanker-sort">Sort:</label>
          <select
            id="tanker-sort"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="distance">Distance (Closest)</option>
            <option value="price_asc">Rate (Lowest first)</option>
            <option value="capacity_desc">Capacity (Highest)</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="empty-state-box">
          <div className="empty-icon">⏳</div>
          <p>Discovering nearby tankers...</p>
        </div>
      )}

      {/* Tanker List */}
      {!isLoading && filteredAndSortedTankers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAndSortedTankers.map((tanker) => (
            <TankerCard
              key={tanker.tankerId}
              tanker={tanker}
              isSelected={selectedTanker?.tankerId === tanker.tankerId}
              onSelect={() => onSelectTanker(tanker)}
              onRequest={onRequestTanker}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAndSortedTankers.length === 0 && (
        <div className="empty-state-box">
          <div className="empty-icon">🚰</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
            No matching tankers found
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
            Try adjusting your water category filter or changing your selected locality.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setWaterTypeFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
