export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant';
  address?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  isPremium?: boolean;
  verification_status?: 'verified' | 'pending' | 'rejected' | 'unverified';
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  logo_url?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  address?: string;
  services?: string;
  capabilities?: string;
  social_media_links?: string;
  application_url?: string;
  opening_hours?: string;
  additional_contact_email?: string;
  key_personnel?: string;
  partners?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'Job' | 'Partnership' | 'Funding' | 'Mentorship' | 'Event' | 'Other' | 'Tenders' | 'Employment' | 'Training' | 'Internships' | 'Bursaries' | 'Incubation';
  category?: string;
  requirements?: string;
  deadline?: string;
  posted_by: string | { organization?: string; name?: string }; // Expanded for joins
  tenant_id?: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  
  // Extra fields from migration
  reference?: string;
  briefingDate?: string;
  briefingLocation?: string;
  briefingType?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;
  fullDescription?: string;
  eligibility?: string[]; // Stored as JSON or text array in DB? Postgres arrays are returned as arrays.
  howToApply?: string;
  benefits?: string[];
  sectors?: string[];
  prizeAmount?: string;
  duration?: string;
  postedDate?: string;
  tenderAdvertUrl?: string;
  tenderDocumentsUrl?: string;
  
  // Helper for UI
  org?: string; 
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'Document' | 'Link' | 'Video' | 'Other';
  url: string;
  category?: string;
  uploaded_by?: string;
  status?: string; // For UI
}
