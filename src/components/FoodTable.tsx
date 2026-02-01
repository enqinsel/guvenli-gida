'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Food } from '@/lib/supabase';

interface FoodTableProps {
    searchQuery: string;
    showArchive: boolean;
    category: string;
}

type SortField = 'announcement_date' | 'company_name' | 'brand' | 'product_name' | 'city' | 'category';
type SortOrder = 'asc' | 'desc';

export default function FoodTable({ searchQuery, showArchive, category }: FoodTableProps) {
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortField, setSortField] = useState<SortField>('announcement_date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const fetchFoods = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchQuery,
                archive: showArchive.toString(),
                page: page.toString(),
                limit: '25',
            });

            if (category) {
                params.set('category', category);
            }

            const response = await fetch(`/api/foods?${params}`);
            const result = await response.json();

            if (result.data) {
                setFoods(result.data);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch foods:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, showArchive, category, page]);

    useEffect(() => {
        fetchFoods();
    }, [fetchFoods]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, showArchive, category]);

    // Client-side sorting
    const sortedFoods = useMemo(() => {
        const sorted = [...foods].sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';

            if (sortField === 'announcement_date') {
                aVal = aVal || '1900-01-01';
                bVal = bVal || '1900-01-01';
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [foods, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'saglik': return 'Sağlık';
            case 'taklit1': return 'Taklit 1';
            case 'taklit2': return 'Taklit 2';
            default: return cat;
        }
    };

    const getCategoryStyle = (cat: string) => {
        switch (cat) {
            case 'saglik':
                return { background: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' };
            case 'taklit1':
                return { background: '#FFEDD5', color: '#9A3412', borderColor: '#FED7AA' };
            case 'taklit2':
                return { background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' };
            default:
                return { background: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB' };
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => (
        <span style={{
            marginLeft: '0.25rem',
            opacity: sortField === field ? 1 : 0.3,
            transition: 'opacity 0.2s ease'
        }}>
            {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <style jsx>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5rem 0;
          }
          .spinner {
            width: 2.5rem;
            height: 2.5rem;
            border: 3px solid #E5E7EB;
            border-top: 3px solid #111827;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="table-container">
            {/* Results Count */}
            <div className="results-header">
                <span>
                    Toplam <strong>{total.toLocaleString('tr-TR')}</strong> kayıt
                </span>
                {showArchive && (
                    <span className="archive-badge">Arşiv Modu</span>
                )}
            </div>

            {sortedFoods.length === 0 ? (
                <div className="empty-state">
                    Kayıt bulunamadı
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('announcement_date')} className="sortable">
                                        Tarih <SortIcon field="announcement_date" />
                                    </th>
                                    <th onClick={() => handleSort('company_name')} className="sortable">
                                        Firma <SortIcon field="company_name" />
                                    </th>
                                    <th onClick={() => handleSort('brand')} className="sortable hide-mobile">
                                        Marka <SortIcon field="brand" />
                                    </th>
                                    <th onClick={() => handleSort('product_name')} className="sortable">
                                        Ürün <SortIcon field="product_name" />
                                    </th>
                                    <th className="hide-tablet">İhlal</th>
                                    <th onClick={() => handleSort('city')} className="sortable hide-mobile">
                                        Şehir <SortIcon field="city" />
                                    </th>
                                    <th onClick={() => handleSort('category')} className="sortable">
                                        Kategori <SortIcon field="category" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFoods.map((food, index) => (
                                    <tr
                                        key={food.id}
                                        className={`table-row ${!food.is_active ? 'inactive' : ''}`}
                                        style={{ animationDelay: `${index * 0.02}s` }}
                                    >
                                        <td className="date-cell">
                                            {food.announcement_date || '-'}
                                        </td>
                                        <td className="company-cell">
                                            {food.company_name}
                                        </td>
                                        <td className="brand-cell hide-mobile">
                                            {food.brand ? (
                                                <Link
                                                    href={`/marka/${encodeURIComponent(food.brand)}`}
                                                    className="brand-link"
                                                >
                                                    {food.brand}
                                                    <span className="link-arrow">→</span>
                                                </Link>
                                            ) : '-'}
                                        </td>
                                        <td className="product-cell">{food.product_name}</td>
                                        <td className="violation-cell hide-tablet">{food.violation || '-'}</td>
                                        <td className="hide-mobile">{food.city || '-'}</td>
                                        <td>
                                            <span
                                                className="category-badge"
                                                style={getCategoryStyle(food.category)}
                                            >
                                                {getCategoryLabel(food.category)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="page-btn"
                            >
                                ← Önceki
                            </button>
                            <span className="page-info">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="page-btn"
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
        .table-container {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .results-header {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .results-header strong {
          color: #111827;
          font-weight: 700;
        }
        
        .archive-badge {
          background: #FEF3C7;
          color: #92400E;
          padding: 0.25rem 0.625rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          color: #6B7280;
          font-size: 1rem;
        }
        
        .table-wrapper {
          overflow-x: auto;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          min-width: 600px;
        }
        
        thead {
          background: linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        th {
          text-align: left;
          padding: 0.75rem 0.5rem;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #111827;
          border-bottom: 2px solid #111827;
          white-space: nowrap;
          user-select: none;
        }
        
        th.sortable {
          cursor: pointer;
          transition: background 0.15s ease;
        }
        
        th.sortable:hover {
          background: rgba(17, 24, 39, 0.05);
        }
        
        td {
          padding: 0.625rem 0.5rem;
          border-bottom: 1px solid #E5E7EB;
          vertical-align: top;
          color: #374151;
          font-size: 0.8125rem;
          line-height: 1.4;
        }
        
        .table-row {
          transition: all 0.15s ease;
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
        }
        
        .table-row:hover {
          background: linear-gradient(90deg, #F3F4F6 0%, #FFFFFF 100%);
          transform: scale(1.002);
        }
        
        .table-row.inactive {
          opacity: 0.5;
        }
        
        .date-cell {
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 0.75rem;
          color: #6B7280;
          white-space: nowrap;
        }
        
        .company-cell {
          font-weight: 600;
          color: #111827;
          max-width: 180px;
        }
        
        .product-cell {
          max-width: 160px;
        }
        
        .brand-cell {
          max-width: 140px;
        }
        
        .brand-cell :global(.brand-link) {
          color: #111827;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s ease;
          padding: 0.125rem 0;
          border-bottom: 1px dashed #9CA3AF;
        }
        
        .brand-cell :global(.brand-link:hover) {
          color: #4F46E5;
          border-bottom-color: #4F46E5;
        }
        
        .brand-cell :global(.link-arrow) {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
          font-size: 0.75rem;
        }
        
        .brand-cell :global(.brand-link:hover .link-arrow) {
          opacity: 1;
          transform: translateX(0);
        }
        
        .violation-cell {
          font-size: 0.75rem;
          color: #6B7280;
          max-width: 200px;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.1875rem 0.5rem;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: 1px solid;
          white-space: nowrap;
          transition: transform 0.15s ease;
        }
        
        .table-row:hover .category-badge {
          transform: scale(1.05);
        }
        
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        
        .page-btn {
          padding: 0.625rem 1.25rem;
          border: 2px solid #111827;
          background: #FFFFFF;
          color: #111827;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .page-btn:hover:not(:disabled) {
          background: #111827;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(17, 24, 39, 0.15);
        }
        
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .page-info {
          padding: 0.625rem 1rem;
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hide-mobile {
            display: none;
          }
          
          table {
            font-size: 0.75rem;
            min-width: auto;
          }
          
          th, td {
            padding: 0.5rem 0.375rem;
          }
          
          th {
            font-size: 0.5625rem;
          }
          
          td {
            font-size: 0.75rem;
          }
          
          .company-cell {
            max-width: 120px;
          }
          
          .product-cell {
            max-width: 100px;
          }
          
          .category-badge {
            font-size: 0.5625rem;
            padding: 0.125rem 0.375rem;
          }
          
          .page-btn {
            padding: 0.5rem 0.875rem;
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 1024px) {
          .hide-tablet {
            display: none;
          }
        }
      `}</style>
        </div>
    );
}
