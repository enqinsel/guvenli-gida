import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const showArchive = searchParams.get('archive') === 'true';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        let query = supabase
            .from('foods')
            .select('*', { count: 'exact' })
            .eq('is_active', !showArchive)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        // Apply category filter
        if (category && ['saglik', 'taklit1', 'taklit2'].includes(category)) {
            query = query.eq('category', category);
        }

        // Apply search filter
        if (search) {
            query = query.or(
                `company_name.ilike.%${search}%,brand.ilike.%${search}%,city.ilike.%${search}%,product_name.ilike.%${search}%`
            );
        }

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
