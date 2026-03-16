import { supabase } from '@/lib/supabase';

export type DocumentType = 'Business Registration' | 'ID Document' | 'Business Profile' | 'Tax Clearance' | 'Other';

export interface SMMEVerification {
    id: string;
    user_id: string;
    document_url: string;
    document_type: DocumentType;
    status: 'pending' | 'verified' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface VerificationDocument {
    type: DocumentType;
    uri: string | null;
    status?: 'pending' | 'verified' | 'rejected';
    required: boolean;
}

class VerificationService {
    // Get all verification documents for a user
    async getAllVerifications(userId: string): Promise<SMMEVerification[]> {
        const { data, error } = await supabase
            .from('sme_verifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('VerificationService.getAllVerifications error:', error);
            throw error;
        }

        return (data as SMMEVerification[]) || [];
    }

    // Get overall verification status (verified if all 3 required documents are verified OR profile is verified)
    async getVerificationStatus(userId: string): Promise<SMMEVerification | null> {
        // First check profile status directly
        const { data: profile } = await supabase
            .from('profiles')
            .select('verification_status')
            .eq('id', userId)
            .single();

        if (profile?.verification_status === 'verified') {
             return {
                id: 'profile-verified',
                user_id: userId,
                document_url: '',
                document_type: 'Other' as DocumentType, // Cast to satisfy type
                status: 'verified',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as SMMEVerification;
        }

        const documents = await this.getAllVerifications(userId);
        
        if (documents.length === 0) return null;

        // Check if all required documents are present and verified
        const requiredTypes: DocumentType[] = ['Business Registration', 'ID Document', 'Business Profile'];
        const hasAllRequired = requiredTypes.every(type => 
            documents.some(doc => doc.document_type === type)
        );

        if (!hasAllRequired) {
            // Return most recent document as status indicator
            return documents[0];
        }

        // Check if all are verified
        const allVerified = documents
            .filter(doc => requiredTypes.includes(doc.document_type))
            .every(doc => doc.status === 'verified');

        if (allVerified) {
            // Return a verified status document
            return documents.find(doc => doc.status === 'verified') || documents[0];
        }

        // Return pending or rejected document
        return documents.find(doc => doc.status === 'rejected') || documents[0];
    }

    async submitVerification(userId: string, documentUrl: string, documentType: DocumentType): Promise<SMMEVerification> {
        // Upsert to replace existing document of the same type
        const { data, error } = await supabase
            .from('sme_verifications')
            .upsert({
                user_id: userId,
                document_url: documentUrl,
                document_type: documentType,
                status: 'pending'
            }, {
                onConflict: 'user_id,document_type'
            })
            .select()
            .single();

        if (error) {
            console.error('VerificationService.submitVerification error:', error);
            throw error;
        }

        return data as SMMEVerification;
    }
    
    // Submit multiple documents at once
    async submitMultipleDocuments(userId: string, documents: { url: string; type: DocumentType }[]): Promise<void> {
        const promises = documents.map(doc => 
            this.submitVerification(userId, doc.url, doc.type)
        );

        await Promise.all(promises);
    }
    
    /**
     * Upload a document to Supabase Storage
     * @param fileUri - Local file URI from the device
     * @param userId - User ID for organizing files
     * @param documentType - Type of document being uploaded
     * @returns Public URL of the uploaded document
     */
    async uploadDocument(fileUri: string, userId?: string, documentType?: string): Promise<string> {
        try {
            // Get file extension from URI
            const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
            const timestamp = Date.now();
            const fileName = `${userId || 'unknown'}_${documentType?.replace(/\s+/g, '_') || 'document'}_${timestamp}.${fileExtension}`;
            // File path should NOT include bucket name - just the folder structure
            const filePath = `${userId}/${fileName}`;

            // Read the file as base64 (for React Native)
            const response = await fetch(fileUri);
            const blob = await response.blob();
            
            // Convert blob to ArrayBuffer for Supabase
            const arrayBuffer = await new Response(blob).arrayBuffer();
        
            // Determine content type
            const contentType = this.getContentType(fileExtension);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('verification-documents')
                .upload(filePath, arrayBuffer, {
                    contentType: contentType,
                    cacheControl: '3600',
                    upsert: false // Don't overwrite existing files
                });

            if (error) {
                console.error('Supabase storage upload error:', error);
                throw new Error(`Failed to upload document: ${error.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('verification-documents')
                .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error('Failed to get public URL for uploaded document');
            }

            return publicUrl;
        } catch (error: any) {
            console.error('VerificationService.uploadDocument error:', error);
            throw new Error(error.message || 'Failed to upload document. Please try again.');
        }
    }

    /**
     * Get the appropriate content type for a file extension
     */
    private getContentType(extension: string): string {
        const contentTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'heic': 'image/heic',
            'heif': 'image/heif',
        };
        return contentTypes[extension] || 'application/octet-stream';
    }

    /**
     * Delete a document from Supabase Storage
     * @param documentUrl - Public URL of the document to delete
     */
    async deleteDocument(documentUrl: string): Promise<void> {
        try {
            // Extract file path from public URL
            // URL format: https://[project].supabase.co/storage/v1/object/public/verification-documents/[userId]/[filename]
            const urlParts = documentUrl.split('/verification-documents/');
            if (urlParts.length < 2) {
                throw new Error('Invalid document URL');
            }
            
            // File path should NOT include bucket name - just the folder structure
            const filePath = urlParts[1];

            const { error } = await supabase.storage
                .from('verification-documents')
                .remove([filePath]);

            if (error) {
                console.error('Supabase storage delete error:', error);
                throw new Error(`Failed to delete document: ${error.message}`);
            }
        } catch (error: any) {
            console.error('VerificationService.deleteDocument error:', error);
            throw new Error(error.message || 'Failed to delete document');
        }
    }
}

export const verificationService = new VerificationService();

