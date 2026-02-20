import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UseAvatarUriResult = {
  uri: string | null;
  isLoading: boolean;
};

let hasWarnedSignedUrlFailure = false;

function isHttpUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

function parseSupabasePublicStorageUrl(url: string): { bucket: string; path: string } | null {
  // Example:
  // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const bucket = match[1];
  const path = decodeURIComponent(match[2]);
  return bucket && path ? { bucket, path } : null;
}

/**
 * Public profile-avatars bucket: resolve synchronously (no network).
 * getPublicUrl() only builds the URL string; no request.
 */
function getPublicProfileAvatarUri(normalized: string): string | null {
  const prefix = 'storage:profile-avatars/';
  if (!normalized.startsWith(prefix)) return null;
  const path = normalized.slice(prefix.length);
  if (!path) return null;
  const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/**
 * Supports 3 avatar formats:
 * - http(s) URL (public or signed)
 * - storage reference: "storage:<bucket>/<path>"
 * - color keyword (blue/green/orange) -> returns null (caller can fallback)
 *
 * profile-avatars is resolved synchronously (bucket is public). Other storage refs use signed URLs (async).
 */
export function useAvatarUri(avatar?: string | null): UseAvatarUriResult {
  const normalized = useMemo(() => (avatar ?? '').trim(), [avatar]);

  // Instant path: public profile-avatars bucket (no network call)
  const syncUri = useMemo(() => getPublicProfileAvatarUri(normalized), [normalized]);

  const [uri, setUri] = useState<string | null>(() => {
    if (normalized && isHttpUrl(normalized)) return normalized;
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!normalized || syncUri) {
      if (!normalized) setUri(null);
      return;
    }

    let cancelled = false;

    async function resolve() {
      if (isHttpUrl(normalized)) {
        const parsed = parseSupabasePublicStorageUrl(normalized);
        if (!parsed) {
          setUri(normalized);
          return;
        }
        setIsLoading(true);
        try {
          const { data, error } = await supabase.storage
            .from(parsed.bucket)
            .createSignedUrl(parsed.path, 60 * 60 * 24 * 7);
          if (cancelled) return;
          setUri(error ? normalized : (data?.signedUrl ?? normalized));
        } finally {
          if (!cancelled) setIsLoading(false);
        }
        return;
      }

      if (!normalized.startsWith('storage:')) {
        setUri(null);
        return;
      }

      const ref = normalized.slice('storage:'.length);
      const firstSlash = ref.indexOf('/');
      if (firstSlash <= 0 || firstSlash === ref.length - 1) {
        setUri(null);
        return;
      }

      const bucket = ref.slice(0, firstSlash);
      const path = ref.slice(firstSlash + 1);

      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
        if (cancelled) return;
        if (error) {
          if (!hasWarnedSignedUrlFailure) {
            hasWarnedSignedUrlFailure = true;
            console.warn('Avatar signed URL failed (storage).', { message: error.message, bucket, path });
          }
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
          setUri(publicData?.publicUrl ?? null);
          return;
        }
        setUri(data?.signedUrl ?? null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [normalized, syncUri]);

  return {
    uri: syncUri ?? uri,
    isLoading: syncUri ? false : isLoading,
  };
}

