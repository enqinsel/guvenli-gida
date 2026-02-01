'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import FoodTable from '@/components/FoodTable';
import SubscribeForm from '@/components/SubscribeForm';
import SubscriberCount from '@/components/SubscriberCount';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [category, setCategory] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat);
  }, []);

  const handleArchiveToggle = useCallback((show: boolean) => {
    setShowArchive(show);
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">
              <Image
                src="/icon.png"
                alt="Güvenli Gıda Logo"
                width={40}
                height={40}
                className="logo-image"
              />
              GÜVENLİ GIDA
            </h1>
            <p className="subtitle">
              T.C. Tarım ve Orman Bakanlığı Gıda İfşa Takip Sistemi
            </p>
          </div>
          <div className="header-right">
            <SubscriberCount />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Info Banner */}
        <div className="info-banner">
          <span className="banner-icon">⚠️</span>
          <div className="banner-content">
            <strong>Önemli:</strong> Bakanlık listesinden kaldırılan ürünler <em>&ldquo;Arşiv&rdquo;</em> modunda görüntülenebilir.
          </div>
        </div>

        {/* Search & Filters */}
        <SearchBar
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onArchiveToggle={handleArchiveToggle}
        />

        {/* Data Table */}
        <FoodTable
          searchQuery={searchQuery}
          showArchive={showArchive}
          category={category}
        />
      </main>

      {/* Subscribe Section */}
      <section className="subscribe-section">
        <SubscribeForm />
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            Veriler{' '}
            <a href="https://guvenilirgida.tarimorman.gov.tr" target="_blank" rel="noopener noreferrer">
              T.C. Tarım ve Orman Bakanlığı
            </a>
            {' '}kaynaklarından alınmaktadır.
          </p>
          <p className="update-info">
            ⏰ Her gün otomatik güncellenir.
          </p>
        </div>
      </footer>

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
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
        }
        
        .header-left {
          animation: slideInLeft 0.4s ease;
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .logo {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin: 0;
        }
        
        .logo :global(.logo-image) {
          border-radius: 4px;
        }
        
        .subtitle {
          font-size: 0.9375rem;
          color: #374151;
          margin: 0.25rem 0 0;
          font-weight: 500;
        }
        
        .header-right {
          animation: slideInRight 0.4s ease;
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .info-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: linear-gradient(90deg, #FEF3C7 0%, #FEF9C3 100%);
          border-left: 4px solid #F59E0B;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .banner-icon {
          font-size: 1.25rem;
        }
        
        .banner-content {
          color: #78350F;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .banner-content strong {
          color: #92400E;
        }
        
        /* Subscribe Section */
        .subscribe-section {
          margin-top: 3rem;
        }
        
        /* Footer */
        .footer {
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
          margin-top: 2rem;
        }
        
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          font-size: 0.8125rem;
          color: #374151;
        }
        
        .footer-content a {
          color: #111827;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .footer-content a:hover {
          color: #6B7280;
        }
        
        .update-info {
          color: #6B7280;
          font-weight: 500;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .logo {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.8125rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .info-banner {
            padding: 0.875rem 1rem;
            font-size: 0.8125rem;
          }
          
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .logo {
            font-size: 1.25rem;
          }
          
          .logo :global(.logo-image) {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
