-- Fix RLS policies for sme_services_products table
-- This script creates the table if it doesn't exist and sets up proper RLS policies

-- Create sme_services_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sme_services_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sme_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Service', 'Product')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT,
  image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sme_services_products_sme_id ON public.sme_services_products(sme_id);
CREATE INDEX IF NOT EXISTS idx_sme_services_products_status ON public.sme_services_products(status);
CREATE INDEX IF NOT EXISTS idx_sme_services_products_type ON public.sme_services_products(type);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_sme_services_products_updated_at ON public.sme_services_products;
CREATE TRIGGER update_sme_services_products_updated_at BEFORE UPDATE ON public.sme_services_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Option 1: Disable RLS (if you don't want to work with policies)
ALTER TABLE public.sme_services_products DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with proper policies (uncomment if you want RLS)
-- ALTER TABLE public.sme_services_products ENABLE ROW LEVEL SECURITY;
-- 
-- -- Everyone can view active services/products
-- DROP POLICY IF EXISTS "SME services/products are viewable by everyone" ON public.sme_services_products;
-- CREATE POLICY "SME services/products are viewable by everyone" ON public.sme_services_products
--     FOR SELECT USING (status = 'active' OR sme_id = auth.uid());
-- 
-- -- SMMEs can create their own services/products
-- DROP POLICY IF EXISTS "SMMEs can create own services/products" ON public.sme_services_products;
-- CREATE POLICY "SMMEs can create own services/products" ON public.sme_services_products
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sme_id);
-- 
-- -- SMMEs can update their own services/products
-- DROP POLICY IF EXISTS "SMMEs can update own services/products" ON public.sme_services_products;
-- CREATE POLICY "SMMEs can update own services/products" ON public.sme_services_products
--     FOR UPDATE USING (auth.uid() = sme_id);
-- 
-- -- SMMEs can delete their own services/products
-- DROP POLICY IF EXISTS "SMMEs can delete own services/products" ON public.sme_services_products;
-- CREATE POLICY "SMMEs can delete own services/products" ON public.sme_services_products
--     FOR DELETE USING (auth.uid() = sme_id);

