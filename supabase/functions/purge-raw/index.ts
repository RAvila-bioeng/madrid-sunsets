import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAW_BUCKET = 'sunsets-raw';
const DEFAULT_RAW_RETENTION_DAYS = 14;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          captured_at: string;
          id: string;
          is_best_of_day: boolean;
          storage_path: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type RawPhotoRow = Database['public']['Tables']['photos']['Row'];

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

function rawRetentionDays(): number {
  const value = Deno.env.get('RAW_RETENTION_DAYS');
  if (!value) {
    return DEFAULT_RAW_RETENTION_DAYS;
  }

  const days = Number(value);
  if (!Number.isInteger(days) || days < 1) {
    throw new Error('RAW_RETENTION_DAYS must be a positive integer.');
  }

  return days;
}

function cutoffIsoDate(days: number): string {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString();
}

async function purgeRawPhotos(retentionDays: number): Promise<number> {
  const supabaseUrl = getRequiredEnv('SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const { data: photos, error: selectError } = await supabase
    .from('photos')
    .select('id, captured_at, storage_path, is_best_of_day')
    .eq('is_best_of_day', false)
    .lt('captured_at', cutoffIsoDate(retentionDays));

  if (selectError) {
    throw new Error(`Could not select raw photos for purge: ${selectError.message}`);
  }

  if (!photos || photos.length === 0) {
    return 0;
  }

  const rows: RawPhotoRow[] = photos;
  const storagePaths = rows.map((photo) => photo.storage_path);
  const photoIds = rows.map((photo) => photo.id);

  const { error: storageError } = await supabase.storage.from(RAW_BUCKET).remove(storagePaths);
  if (storageError) {
    throw new Error(`Could not delete raw storage objects: ${storageError.message}`);
  }

  const { error: deleteError } = await supabase.from('photos').delete().in('id', photoIds);
  if (deleteError) {
    throw new Error(`Could not delete raw photo rows: ${deleteError.message}`);
  }

  return rows.length;
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
  }

  try {
    const deleted = await purgeRawPhotos(rawRetentionDays());
    return jsonResponse({ ok: true, deleted }, 200);
  } catch (error) {
    return jsonResponse({ ok: false, error: errorMessage(error) }, 500);
  }
});
