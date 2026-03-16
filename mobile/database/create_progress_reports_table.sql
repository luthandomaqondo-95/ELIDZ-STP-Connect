-- Create Progress Reports Table for Funded SMMEs
-- This allows SMMEs who received funding to upload progress reports

CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  smme_id UUID REFERENCES public.profiles(id) NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  document_url TEXT, -- URL to uploaded progress report document
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'revision_requested')),
  admin_feedback TEXT, -- Feedback from admin reviewing the report
  reviewed_by UUID REFERENCES public.profiles(id), -- Admin who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_reports_application_id ON public.progress_reports(application_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_smme_id ON public.progress_reports(smme_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_opportunity_id ON public.progress_reports(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_status ON public.progress_reports(status);
CREATE INDEX IF NOT EXISTS idx_progress_reports_created_at ON public.progress_reports(created_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_progress_reports_updated_at ON public.progress_reports;
CREATE TRIGGER update_progress_reports_updated_at BEFORE UPDATE ON public.progress_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SMMEs can view their own progress reports
CREATE POLICY "SMMEs can view own progress reports" ON public.progress_reports
    FOR SELECT USING (auth.uid() = smme_id);

-- SMMEs can create progress reports for their accepted applications
CREATE POLICY "SMMEs can create progress reports" ON public.progress_reports
    FOR INSERT WITH CHECK (
        auth.uid() = smme_id 
        AND EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = progress_reports.application_id 
            AND applications.applicant_id = auth.uid()
            AND applications.status = 'accepted'
        )
    );

-- SMMEs can update their own submitted progress reports
CREATE POLICY "SMMEs can update own progress reports" ON public.progress_reports
    FOR UPDATE USING (
        auth.uid() = smme_id 
        AND status = 'submitted'
    );

-- Note: Admin policies should be added separately based on your admin role setup
-- Example:
-- CREATE POLICY "Admins can view all progress reports" ON public.progress_reports
--     FOR SELECT USING (
--         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
--     );

