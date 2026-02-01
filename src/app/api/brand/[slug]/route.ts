import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const brand = decodeURIComponent(slug);

        // Get all records for this brand (both active and archived)
        const { data, error } = await supabase
            .from('foods')
            .select('*')
            .eq('brand', brand)
            .order('announcement_date', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate stats
        const activeCount = data?.filter(f => f.is_active).length || 0;
        const archivedCount = data?.filter(f => !f.is_active).length || 0;

        return NextResponse.json({
            brand,
            records: data || [],
            stats: {
                total: data?.length || 0,
                active: activeCount,
                archived: archivedCount
            }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
