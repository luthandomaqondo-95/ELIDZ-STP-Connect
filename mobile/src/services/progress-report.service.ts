import { supabase } from '@/lib/supabase';

export interface ProgressReport {
  id: string;
  application_id: string;
  smme_id: string;
  opportunity_id: string;
  title: string;
  description?: string | null;
  report_period_start: string;
  report_period_end: string;
  document_url?: string | null;
  status: 'submitted' | 'reviewed' | 'approved' | 'revision_requested';
  admin_feedback?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  opportunity?: {
    id: string;
    title: string;
    type: string;
  };
  application?: {
    id: string;
    status: string;
  };
}

export interface CreateProgressReportData {
  application_id: string;
  opportunity_id: string;
  title: string;
  description?: string;
  report_period_start: string; // ISO date string
  report_period_end: string; // ISO date string
  documentUri?: string; // Local file URI to upload
}

class ProgressReportService {
  /**
   * Get all progress reports for an SMME
   */
  async getSMMEProgressReports(smmeId: string): Promise<ProgressReport[]> {
    const { data, error } = await supabase
      .from('progress_reports')
      .select(`
        *,
        opportunity:opportunities(id, title, type),
        application:applications(id, status)
      `)
      .eq('smme_id', smmeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ProgressReportService.getSMMEProgressReports error:', error);
      throw new Error(error.message || 'Failed to fetch progress reports');
    }

    return (data || []) as ProgressReport[];
  }

  /**
   * Get progress reports for a specific application
   */
  async getApplicationProgressReports(applicationId: string): Promise<ProgressReport[]> {
    const { data, error } = await supabase
      .from('progress_reports')
      .select(`
        *,
        opportunity:opportunities(id, title, type)
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ProgressReportService.getApplicationProgressReports error:', error);
      throw new Error(error.message || 'Failed to fetch progress reports');
    }

    return (data || []) as ProgressReport[];
  }

  /**
   * Get accepted funding applications for an SMME
   */
  async getAcceptedFundingApplications(smmeId: string): Promise<Array<{
    id: string;
    opportunity_id: string;
    opportunity: {
      id: string;
      title: string;
      type: string;
    };
    submitted_at: string;
  }>> {
    // First get accepted applications
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, opportunity_id, submitted_at')
      .eq('applicant_id', smmeId)
      .eq('status', 'accepted')
      .order('submitted_at', { ascending: false });

    if (appsError) {
      console.error('ProgressReportService.getAcceptedFundingApplications error:', appsError);
      throw new Error(appsError.message || 'Failed to fetch accepted applications');
    }

    if (!applications || applications.length === 0) {
      return [];
    }

    // Get opportunity IDs
    const opportunityIds = applications.map(app => app.opportunity_id).filter(Boolean);

    if (opportunityIds.length === 0) {
      return [];
    }

    // Get opportunities (only Funding and Incubation types)
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('id, title, type')
      .in('id', opportunityIds)
      .in('type', ['Funding', 'Incubation']);

    if (oppsError) {
      console.error('ProgressReportService.getAcceptedFundingApplications opportunities error:', oppsError);
      throw new Error(oppsError.message || 'Failed to fetch opportunities');
    }

    // Combine applications with their opportunities
    const result = applications
      .map(app => {
        const opportunity = opportunities?.find(opp => opp.id === app.opportunity_id);
        if (!opportunity) return null;
        
        return {
          id: app.id,
          opportunity_id: app.opportunity_id,
          opportunity: {
            id: opportunity.id,
            title: opportunity.title,
            type: opportunity.type,
          },
          submitted_at: app.submitted_at,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return result;
  }

  /**
   * Upload progress report document to storage
   */
  private async uploadDocument(fileUri: string, smmeId: string, reportId: string): Promise<string> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${reportId}_${Date.now()}.${fileExtension}`;
      const filePath = `${smmeId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('progress-reports')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type || 'application/pdf',
        });

      if (error) {
        console.error('ProgressReportService.uploadDocument error:', error);
        throw new Error(`Failed to upload document: ${error.message}`);
      }

      // Get signed URL (since bucket is private)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('progress-reports')
        .createSignedUrl(filePath, 31536000); // 1 year expiry

      if (urlError) {
        console.error('ProgressReportService.uploadDocument URL error:', urlError);
        throw new Error(`Failed to get document URL: ${urlError.message}`);
      }

      return urlData.signedUrl;
    } catch (error: any) {
      console.error('ProgressReportService.uploadDocument error:', error);
      throw new Error(error.message || 'Failed to upload document');
    }
  }

  /**
   * Create a new progress report
   */
  async createProgressReport(data: CreateProgressReportData): Promise<ProgressReport> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to submit a progress report');
    }

    // First, create the progress report record
    const { data: report, error: insertError } = await supabase
      .from('progress_reports')
      .insert({
        application_id: data.application_id,
        smme_id: user.id,
        opportunity_id: data.opportunity_id,
        title: data.title,
        description: data.description || null,
        report_period_start: data.report_period_start,
        report_period_end: data.report_period_end,
        status: 'submitted',
      })
      .select()
      .single();

    if (insertError) {
      console.error('ProgressReportService.createProgressReport insert error:', insertError);
      throw new Error(insertError.message || 'Failed to create progress report');
    }

    // Upload document if provided
    let documentUrl = null;
    if (data.documentUri) {
      try {
        documentUrl = await this.uploadDocument(data.documentUri, user.id, report.id);
        
        // Update the report with the document URL
        const { error: updateError } = await supabase
          .from('progress_reports')
          .update({ document_url: documentUrl })
          .eq('id', report.id);

        if (updateError) {
          console.error('ProgressReportService.createProgressReport update error:', updateError);
          // Don't throw - report was created, just document URL update failed
        }
      } catch (uploadError: any) {
        console.error('ProgressReportService.createProgressReport upload error:', uploadError);
        // Report was created, but document upload failed
        // Could optionally delete the report or mark it as incomplete
      }
    }

    // Fetch the complete report with joins
    const { data: completeReport, error: fetchError } = await supabase
      .from('progress_reports')
      .select(`
        *,
        opportunity:opportunities(id, title, type),
        application:applications(id, status)
      `)
      .eq('id', report.id)
      .single();

    if (fetchError) {
      console.error('ProgressReportService.createProgressReport fetch error:', fetchError);
      // Return the basic report if fetch fails
      return { ...report, document_url: documentUrl } as ProgressReport;
    }

    return completeReport as ProgressReport;
  }

  /**
   * Get a specific progress report by ID
   */
  async getProgressReportById(reportId: string): Promise<ProgressReport | null> {
    const { data, error } = await supabase
      .from('progress_reports')
      .select(`
        *,
        opportunity:opportunities(id, title, type),
        application:applications(id, status)
      `)
      .eq('id', reportId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('ProgressReportService.getProgressReportById error:', error);
      throw new Error(error.message || 'Failed to fetch progress report');
    }

    return data as ProgressReport;
  }
}

export const progressReportService = new ProgressReportService();

