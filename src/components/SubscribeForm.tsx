'use client';

import { useState } from 'react';

export default function SubscribeForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Başarıyla abone oldunuz! Yeni ifşalardan haberdar edileceksiniz.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Bir hata oluştu');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
        }

        // Reset status after 5 seconds
        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 5000);
    };

    return (
        <div style={{
            background: '#111827',
            color: '#FFFFFF',
            padding: '3rem 1.5rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ maxWidth: '600px' }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: '#FFFFFF'
                    }}>
                        📬 Gıda Güvenliği Bülteni
                    </h3>
                    <p style={{
                        color: '#9CA3AF',
                        marginBottom: '1.5rem',
                        fontSize: '1rem',
                        lineHeight: 1.6
                    }}>
                        Yeni ifşalar eklendiğinde anında e-posta ile bilgilendirileceksiniz.
                    </p>

                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz"
                            required
                            disabled={status === 'loading'}
                            style={{
                                flex: '1',
                                minWidth: '250px',
                                padding: '0.875rem 1rem',
                                background: '#FFFFFF',
                                border: 'none',
                                color: '#111827',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                padding: '0.875rem 2rem',
                                background: '#FFFFFF',
                                border: 'none',
                                color: '#111827',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: status === 'loading' ? 'wait' : 'pointer',
                                opacity: status === 'loading' ? 0.7 : 1,
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {status === 'loading' ? 'Kaydediliyor...' : 'Abone Ol'}
                        </button>
                    </form>

                    {message && (
                        <p style={{
                            marginTop: '1rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: status === 'success' ? '#4ADE80' : '#F87171'
                        }}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
