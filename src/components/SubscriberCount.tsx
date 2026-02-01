'use client';

import { useState, useEffect } from 'react';

export default function SubscriberCount() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await fetch('/api/subscribers');
                const data = await response.json();
                setCount(data.count || 0);
            } catch (error) {
                console.error('Failed to fetch subscriber count:', error);
            }
        };

        fetchCount();

        // Refresh every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    if (count === null) {
        return null;
    }

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 1rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#065F46'
        }}>
            <span style={{
                width: '0.5rem',
                height: '0.5rem',
                background: '#10B981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
            }}></span>
            <span>
                <strong style={{ fontWeight: 700 }}>{count.toLocaleString('tr-TR')}</strong> kişi gıda güvenliğini takip ediyor
            </span>
            <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
