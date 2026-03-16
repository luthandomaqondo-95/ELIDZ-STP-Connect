-- Fix: PostgREST fails when two overloads of search_za_postal_codes exist.
-- Error was: "Could not choose the best candidate function between:
--   public.search_za_postal_codes(p_limit => integer, p_query => text),
--   public.search_za_postal_codes(p_query => text, p_limit => integer)"
--
-- Keep the (p_limit, p_query) version; drop the (p_query, p_limit) one if it exists.
DROP FUNCTION IF EXISTS public.search_za_postal_codes(text, integer);

-- Ensure the correct overload exists (idempotent).
CREATE OR REPLACE FUNCTION public.search_za_postal_codes(
  p_limit integer DEFAULT 500,
  p_query text DEFAULT ''
)
RETURNS TABLE (postal_code text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT z.postal_code
  FROM public.za_postal_codes z
  WHERE
    z.country_code = 'ZA'
    AND (
      z.postal_code ILIKE '%' || p_query || '%'
      OR z.place_name ILIKE '%' || p_query || '%'
      OR z.admin_name2 ILIKE '%' || p_query || '%'
      OR z.admin_name3 ILIKE '%' || p_query || '%'
    )
  ORDER BY z.postal_code
  LIMIT LEAST(GREATEST(p_limit, 1), 2000);
$$;

GRANT EXECUTE ON FUNCTION public.search_za_postal_codes(integer, text) TO anon, authenticated;
