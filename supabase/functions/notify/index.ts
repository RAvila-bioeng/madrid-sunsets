import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BEST_BUCKET = 'sunsets-best';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          day_date: string;
          id: string;
          score: number;
          storage_path: string;
        };
        Insert: {
          day_date: string;
          id?: string;
          score: number;
          storage_path: string;
        };
        Update: {
          day_date?: string;
          id?: string;
          score?: number;
          storage_path?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type NotifyRequest = {
  date: string;
  photo_id: string;
};

type PhotoRow = Database['public']['Tables']['photos']['Row'];

function jsonResponse(body: JsonValue, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function parseRequestBody(body: unknown): NotifyRequest {
  if (!isPlainObject(body)) {
    throw new Error('Request body must be a JSON object.');
  }

  const date = body.date;
  const photoId = body.photo_id;

  if (typeof date !== 'string' || !isIsoDate(date)) {
    throw new Error('date must be an ISO date string.');
  }

  if (typeof photoId !== 'string' || !UUID_PATTERN.test(photoId)) {
    throw new Error('photo_id must be a valid UUID string.');
  }

  return { date, photo_id: photoId };
}

function formatSpanishDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(value);
}

function buildCaption(photo: PhotoRow): string {
  const formattedDate = formatSpanishDate(photo.day_date);
  const formattedScore = (photo.score * 10).toFixed(1);

  return `🌅 Tu atardecer de hoy — ${formattedDate}\nPuntuación: ${formattedScore}/10 ⭐`;
}

async function fetchImage(publicUrl: string): Promise<Blob> {
  const response = await fetch(publicUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch photo: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const bytes = await response.arrayBuffer();

  return new Blob([bytes], { type: contentType });
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  image: Blob,
  caption: string,
): Promise<void> {
  const formData = new FormData();
  formData.set('chat_id', chatId);
  formData.set('caption', caption);
  formData.set('photo', image, 'sunset.jpg');

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram sendPhoto failed: ${response.status} ${detail}`);
  }
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
  }

  let payload: NotifyRequest;
  try {
    const body: unknown = await request.json();
    payload = parseRequestBody(body);
  } catch (error) {
    return jsonResponse({ ok: false, error: errorMessage(error) }, 400);
  }

  try {
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const botToken = getRequiredEnv('TELEGRAM_BOT_TOKEN');
    const chatId = getRequiredEnv('TELEGRAM_CHAT_ID');

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
    const { data: photo, error } = await supabase
      .from('photos')
      .select('id, storage_path, score, day_date')
      .eq('id', payload.photo_id)
      .single();

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500;
      return jsonResponse({ ok: false, error: error.message }, status);
    }

    if (!photo) {
      return jsonResponse({ ok: false, error: 'Photo not found.' }, 404);
    }

    if (photo.day_date !== payload.date) {
      return jsonResponse(
        { ok: false, error: 'photo_id does not belong to the requested date.' },
        400,
      );
    }

    const publicUrl = photo.storage_path.startsWith('http')
      ? photo.storage_path
      : supabase.storage.from(BEST_BUCKET).getPublicUrl(photo.storage_path).data.publicUrl;
    const image = await fetchImage(publicUrl);
    await sendTelegramPhoto(botToken, chatId, image, buildCaption(photo));

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse({ ok: false, error: errorMessage(error) }, 500);
  }
});
