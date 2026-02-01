import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch subscriber count
export async function GET() {
    try {
        const { count, error } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact', head: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ count: count || 0 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add new subscriber
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Geçerli bir e-posta adresi girin' },
                { status: 400 }
            );
        }

        // Insert subscriber
        const { data, error } = await supabase
            .from('subscribers')
            .insert({ email: email.toLowerCase().trim() })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // Unique constraint violation
                return NextResponse.json(
                    { error: 'Bu e-posta zaten kayıtlı' },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
