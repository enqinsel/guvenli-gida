'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Food } from '@/lib/supabase';

interface BrandData {
    brand: string;
    records: Food[];
    stats: {
        total: number;
        active: number;
        archived: number;
    };
}

export default function BrandDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<BrandData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                const slug = params.slug as string;
                const response = await fetch(`/api/brand/${encodeURIComponent(slug)}`);
                const result = await response.json();

                if (response.ok) {
                    setData(result);
                } else {
                    setError(result.error || 'Veri yüklenemedi');
                }
            } catch (err) {
                setError('Bağlantı hatası');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchBrandData();
        }
    }, [params.slug]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">
                    <div className="spinner"></div>
                </div>
                <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 3rem;
            height: 3rem;
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

    if (error || !data) {
        return (
            <div className="page-container">
                <div className="error-state">
                    <h2>Hata</h2>
                    <p>{error || 'Marka bulunamadı'}</p>
                    <Link href="/" className="back-link">← Ana Sayfaya Dön</Link>
                </div>
                <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-state {
            text-align: center;
            color: #374151;
          }
          .error-state h2 {
            color: #991B1B;
            margin-bottom: 0.5rem;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <Link href="/" className="back-button">
                        ← Listeye Dön
                    </Link>
                    <div className="brand-header">
                        <h1 className="brand-name">{data.brand || 'Bilinmeyen Marka'}</h1>
                        <p className="record-count">Toplam {data.stats.total} İfşa Kaydı</p>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card active">
                        <div className="stat-number">{data.stats.active}</div>
                        <div className="stat-label">Aktif İfşa</div>
                        <div className="stat-desc">Bakanlık listesinde</div>
                    </div>
                    <div className="stat-card archived">
                        <div className="stat-number">{data.stats.archived}</div>
                        <div className="stat-label">Arşivlenmiş</div>
                        <div className="stat-desc">Listeden kaldırıldı</div>
                    </div>
                    <div className="stat-card total">
                        <div className="stat-number">{data.stats.total}</div>
                        <div className="stat-label">Toplam Kayıt</div>
                        <div className="stat-desc">Tüm sicil geçmişi</div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section">
                <h2 className="section-title">İfşa Sicil Geçmişi</h2>
                <div className="timeline">
                    {data.records.map((record, index) => (
                        <div
                            key={record.id}
                            className={`timeline-item ${record.is_active ? 'active' : 'archived'}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="timeline-marker">
                                <div className="marker-dot"></div>
                                {index < data.records.length - 1 && <div className="marker-line"></div>}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="timeline-date">
                                        {record.announcement_date || 'Tarih bilinmiyor'}
                                    </span>
                                    <span className={`status-badge ${record.is_active ? 'active' : 'archived'}`}>
                                        {record.is_active ? '🔴 Aktif' : '📦 Arşiv'}
                                    </span>
                                </div>
                                <h3 className="product-name">{record.product_name}</h3>
                                <p className="company-name">{record.company_name}</p>
                                {record.violation && (
                                    <div className="violation-box">
                                        <strong>Uygunsuzluk:</strong> {record.violation}
                                    </div>
                                )}
                                <div className="meta-info">
                                    {record.city && <span>📍 {record.city}</span>}
                                    {record.batch_number && <span>📦 Parti: {record.batch_number}</span>}
                                </div>
                                {!record.is_active && (
                                    <div className="archive-notice">
                                        ℹ️ Bakanlık listesinden kaldırıldı ama arşivimizde mevcut
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: #FFFFFF;
        }
        
        /* Header */
        .header {
          border-bottom: 4px solid #111827;
          background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
        }
        
        .header-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          border: 2px solid #111827;
          background: #FFFFFF;
          color: #111827;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .back-button:hover {
          background: #111827;
          color: #FFFFFF;
          transform: translateX(-4px);
        }
        
        .brand-header {
          animation: fadeIn 0.4s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .brand-name {
          font-size: 2.5rem;
          font-weight: 900;
          color: #111827;
          letter-spacing: -0.03em;
          margin: 0;
          line-height: 1.2;
        }
        
        .record-count {
          font-size: 1.125rem;
          color: #6B7280;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        /* Stats */
        .stats-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .stat-card {
          padding: 1.5rem;
          border: 2px solid #E5E7EB;
          text-align: center;
          transition: all 0.2s ease;
          animation: slideUp 0.4s ease forwards;
          opacity: 0;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .stat-card.active {
          border-color: #FEE2E2;
          background: linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%);
        }
        
        .stat-card.archived {
          border-color: #FEF3C7;
          background: linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%);
        }
        
        .stat-card.total {
          border-color: #111827;
          background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 900;
          color: #111827;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #374151;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .stat-desc {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin-top: 0.25rem;
        }
        
        /* Timeline */
        .timeline-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #111827;
        }
        
        .timeline {
          position: relative;
        }
        
        .timeline-item {
          display: flex;
          gap: 1.5rem;
          animation: fadeInLeft 0.4s ease forwards;
          opacity: 0;
        }
        
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        
        .marker-dot {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background: #111827;
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 0 2px #111827;
          z-index: 1;
        }
        
        .timeline-item.archived .marker-dot {
          background: #9CA3AF;
          box-shadow: 0 0 0 2px #9CA3AF;
        }
        
        .marker-line {
          width: 2px;
          flex: 1;
          background: #E5E7EB;
          min-height: 2rem;
        }
        
        .timeline-content {
          flex: 1;
          padding-bottom: 2rem;
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 1.5rem;
        }
        
        .timeline-item:last-child .timeline-content {
          border-bottom: none;
        }
        
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .timeline-date {
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 0.8125rem;
          color: #6B7280;
          font-weight: 500;
        }
        
        .status-badge {
          padding: 0.25rem 0.625rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        
        .status-badge.active {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        .status-badge.archived {
          background: #F3F4F6;
          color: #6B7280;
        }
        
        .product-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem;
        }
        
        .company-name {
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0 0 0.75rem;
        }
        
        .violation-box {
          background: #F9FAFB;
          border-left: 3px solid #111827;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          color: #374151;
          margin-bottom: 0.75rem;
        }
        
        .violation-box strong {
          color: #111827;
        }
        
        .meta-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          color: #6B7280;
        }
        
        .archive-notice {
          margin-top: 0.75rem;
          padding: 0.625rem 0.875rem;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          font-size: 0.75rem;
          color: #92400E;
          font-weight: 500;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .brand-name {
            font-size: 1.75rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            padding: 1rem;
          }
          
          .stat-number {
            font-size: 2rem;
          }
          
          .timeline-item {
            gap: 1rem;
          }
          
          .timeline-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
}
