import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { getCurrentUser, isAdmin } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: photoId } = await params;

  const body = (await request.json()) as unknown;
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).date !== 'string' ||
    !(body as Record<string, unknown>).date
  ) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  }
  const { date } = body as { date: string };

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = createServiceRoleClient();

  const unmarkResult = await db
    .from('photos')
    .update({ is_best_of_day: false })
    .eq('day_date', date);
  const { error: err1 } = unmarkResult;
  if (err1) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const markResult = await db.from('photos').update({ is_best_of_day: true }).eq('id', photoId);
  const { error: err2 } = markResult;
  if (err2) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  const daysResult = await db.from('days').update({ best_photo_id: photoId }).eq('date', date);
  const { error: err3 } = daysResult;
  if (err3) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  revalidatePath('/', 'layout');

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '');
  fetch(`${base}/functions/v1/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
    },
    body: JSON.stringify({ date, photo_id: photoId }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
