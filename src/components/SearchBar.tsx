'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onArchiveToggle: (showArchive: boolean) => void;
}

export default function SearchBar({ onSearch, onCategoryChange, onArchiveToggle }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [category, setCategory] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange(value);
  };

  const handleModeChange = (isArchive: boolean) => {
    setShowArchive(isArchive);
    onArchiveToggle(isArchive);
  };

  return (
    <div className="search-container">
      <div className="search-row">
        {/* Search Input */}
        <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Firma, marka veya şehir ara..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="search-input"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="clear-btn"
              aria-label="Temizle"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="category-select"
        >
          <option value="">Tüm Kategoriler</option>
          <option value="saglik">🔴 Sağlık Riski</option>
          <option value="taklit1">🟠 Taklit/Tağşiş 1</option>
          <option value="taklit2">🟡 Taklit/Tağşiş 2</option>
        </select>

        {/* Mode Toggle Buttons */}
        <div className="mode-buttons">
          <button
            onClick={() => handleModeChange(false)}
            className={`mode-btn ${!showArchive ? 'active' : ''}`}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">Aktif Liste</span>
          </button>
          <button
            onClick={() => handleModeChange(true)}
            className={`mode-btn archive ${showArchive ? 'active' : ''}`}
          >
            <span className="btn-icon">📦</span>
            <span className="btn-text">Arşiv</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .search-container {
          margin-bottom: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .search-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: stretch;
        }
        
        .search-input-wrapper {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          border: 2px solid #D1D5DB;
          background: #FFFFFF;
          transition: all 0.2s ease;
        }
        
        .search-input-wrapper.focused {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
        }
        
        .search-icon {
          font-size: 1rem;
          opacity: 0.5;
        }
        
        .search-input {
          flex: 1;
          padding: 0.75rem 0;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          color: #111827;
          outline: none;
        }
        
        .search-input::placeholder {
          color: #9CA3AF;
        }
        
        .clear-btn {
          width: 1.5rem;
          height: 1.5rem;
          border: none;
          background: #E5E7EB;
          color: #6B7280;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        
        .clear-btn:hover {
          background: #111827;
          color: #FFFFFF;
        }
        
        .category-select {
          padding: 0.75rem 1rem;
          padding-right: 2rem;
          border: 2px solid #D1D5DB;
          background: #FFFFFF;
          font-size: 0.875rem;
          color: #111827;
          cursor: pointer;
          outline: none;
          min-width: 160px;
          transition: all 0.2s ease;
        }
        
        .category-select:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
        }
        
        /* Mode Toggle Buttons */
        .mode-buttons {
          display: flex;
          border: 2px solid #111827;
          overflow: hidden;
        }
        
        .mode-btn {
          padding: 0.75rem 1.25rem;
          border: none;
          background: #FFFFFF;
          color: #111827;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .mode-btn:first-child {
          border-right: 1px solid #E5E7EB;
        }
        
        .mode-btn:hover:not(.active) {
          background: #F3F4F6;
        }
        
        .mode-btn.active {
          background: #111827;
          color: #FFFFFF;
        }
        
        .mode-btn.archive.active {
          background: #92400E;
          color: #FFFFFF;
        }
        
        .btn-icon {
          font-size: 1rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .search-row {
            flex-direction: column;
          }
          
          .search-input-wrapper,
          .category-select {
            width: 100%;
            min-width: auto;
          }
          
          .mode-buttons {
            width: 100%;
          }
          
          .mode-btn {
            flex: 1;
            justify-content: center;
          }
        }
        
        @media (max-width: 768px) {
          .search-input {
            font-size: 16px; /* Prevents iOS zoom */
          }
        }
      `}</style>
    </div>
  );
}
