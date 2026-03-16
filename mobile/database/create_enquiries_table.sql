-- Create Enquiries Table for Contact/Enquiry Forms
-- This allows users to make enquiries about product lines, facilities, tenants, etc.

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('Product Line', 'Facility', 'Tenant', 'General', 'Opportunity', 'Other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  related_facility_id TEXT, -- Facility ID if enquiry is about a specific facility
  related_tenant_id UUID REFERENCES public.tenants(id), -- Tenant ID if enquiry is about a specific tenant
  related_opportunity_id UUID REFERENCES public.opportunities(id), -- Opportunity ID if enquiry is about an opportunity
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  response TEXT, -- Admin response
  responded_by UUID REFERENCES public.profiles(id), -- Admin who responded
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON public.enquiries(enquiry_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own enquiries
CREATE POLICY "Users can view own enquiries" ON public.enquiries
    FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create enquiries
CREATE POLICY "Authenticated users can create enquiries" ON public.enquiries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own enquiries (before admin response)
CREATE POLICY "Users can update own enquiries" ON public.enquiries
    FOR UPDATE USING (auth.uid() = user_id AND status = 'new');

-- Note: Admin policies should be added separately based on your admin role setup
-- Example:
-- CREATE POLICY "Admins can view all enquiries" ON public.enquiries
--     FOR SELECT USING (
--         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
--     );

