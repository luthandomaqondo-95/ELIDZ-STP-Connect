import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types';

function OpportunityDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string; opportunity?: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunity() {
      if (!params.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('opportunities')
          .select('*, posted_by(organization)')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (data) {
          // Map DB snake_case to UI camelCase
          const mapped: Opportunity = {
            ...data,
            org: data.posted_by?.organization || 'ELIDZ',
            briefingDate: data.briefing_date,
            briefingLocation: data.briefing_location,
            briefingType: data.briefing_type,
            contactEmail: data.contact_email,
            contactPhone: data.contact_phone,
            applicationUrl: data.application_url,
            fullDescription: data.full_description,
            tenderAdvertUrl: data.tender_advert_url,
            tenderDocumentsUrl: data.tender_documents_url,
            howToApply: data.how_to_apply,
            prizeAmount: data.prize_amount,
            postedDate: data.posted_date,
          };
          setOpportunity(mapped);
        }
      } catch (err) {
        console.error('Error fetching opportunity details:', err);
      } finally {
        setLoading(false);
      }
    }

    // Use passed object if available immediately, but still fetch fresh data
    if (params.opportunity) {
      try {
        setOpportunity(JSON.parse(params.opportunity));
        setLoading(false);
      } catch (e) {
        // Fallback to fetch
        fetchOpportunity();
      }
    } else {
      fetchOpportunity();
    }
  }, [params.id, params.opportunity]);

  if (loading) {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <ActivityIndicator size="large" color={colors.primary} />
       </View>
     );
  }

  if (!opportunity) {
    return (
      <ScreenScrollView>
        <Text style={[Typography.h3, { textAlign: 'center', marginTop: Spacing.xl }]}>
          Opportunity not found
        </Text>
        <Pressable
          style={({ pressed }) => [
            {
              marginTop: Spacing.lg,
              padding: Spacing.lg,
              borderRadius: BorderRadius.button,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.7 : 1,
              alignItems: 'center',
            },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[Typography.body, { color: colors.buttonText, fontWeight: '600' }]}>
            Go Back
          </Text>
        </Pressable>
      </ScreenScrollView>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Tenders': return 'file-text';
      case 'Employment': return 'briefcase';
      case 'Training': return 'book-open';
      case 'Internships': return 'user';
      case 'Bursaries': return 'graduation-cap';
      case 'Incubation': return 'trending-up';
      case 'Funding': return 'dollar-sign';
      default: return 'info';
    }
  };

  const typeColors: Record<string, string> = {
    Tenders: colors.primary,
    Employment: colors.secondary,
    Training: colors.accent,
    Internships: colors.secondary,
    Bursaries: colors.primary,
    Incubation: colors.accent,
    Funding: colors.primary,
  };

  const handleApplyNow = () => {
    if (opportunity.type === 'Tenders') {
      // For tenders, direct to the ELIDZ Tender Portal
      Linking.openURL('https://tenderportal.elidz.co.za/');
    } else if (opportunity.applicationUrl) {
      Linking.openURL(opportunity.applicationUrl);
    } else {
      router.push({ pathname: '/application-form', params: {
        opportunityTitle: opportunity.title,
        opportunityId: opportunity.id,
      } });
    }
  };

  const handleTenderPortalRegister = () => {
    Linking.openURL('https://tenderportal.elidz.co.za/Identity/Account/Register');
  };

  const handleTenderPortalLogin = () => {
    Linking.openURL('https://tenderportal.elidz.co.za/Identity/Account/Login');
  };

  const handleTenderPortalSubmit = () => {
    Linking.openURL('https://tenderportal.elidz.co.za/FileUpload');
  };

  const handleDownloadTenderAdvert = () => {
    if (opportunity.tenderAdvertUrl) {
      Linking.openURL(opportunity.tenderAdvertUrl);
    }
  };

  const handleDownloadTenderDocuments = () => {
    if (opportunity.tenderDocumentsUrl) {
      Linking.openURL(opportunity.tenderDocumentsUrl);
    }
  };

  const handleDownloadUserGuide = () => {
    Linking.openURL('https://www.elidz.co.za/wp-content/uploads/2022/03/ELIDZ-Service-Provider-Manual.pdf');
  };

  const handleDownloadProcurementHandbook = () => {
    Linking.openURL('https://www.elidz.co.za/wp-content/uploads/2022/04/ELIDZ-PROCUREMENT-HANDBOOK-2022.pdf');
  };

  const handleContactEmail = () => {
    if (opportunity.contactEmail) {
      const email = opportunity.contactEmail.split(' or ')[0]; // Get first email if multiple
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleContactPhone = () => {
    if (opportunity.contactPhone) {
      Linking.openURL(`tel:${opportunity.contactPhone}`);
    }
  };

  return (
    <ScreenScrollView>
      <View style={[styles.headerCard, { backgroundColor: typeColors[opportunity.type] || colors.primary }]}>
        <View style={[styles.typeBadge, { backgroundColor: colors.buttonText }]}>
          <Feather name={getTypeIcon(opportunity.type) as any} size={16} color={typeColors[opportunity.type] || colors.primary} />
          <Text style={[Typography.caption, { color: typeColors[opportunity.type] || colors.primary, marginLeft: Spacing.xs }]}>
            {opportunity.type}
          </Text>
        </View>
        <Text style={[Typography.h2, { color: colors.buttonText, marginTop: Spacing.lg }]}>
          {opportunity.title}
        </Text>
        <Text style={[Typography.body, { color: colors.buttonText, opacity: 0.9, marginTop: Spacing.sm }]}>
          {opportunity.org}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
        {opportunity.reference && (
          <View style={styles.infoRow}>
            <Feather name="hash" size={18} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.md }]}>
              Reference: {opportunity.reference}
            </Text>
          </View>
        )}
        <View style={[styles.infoRow, { marginTop: opportunity.reference ? Spacing.md : 0 }]}>
          <Feather name="calendar" size={18} color={colors.textSecondary} />
          <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.md }]}>
            Deadline: {opportunity.deadline}
          </Text>
        </View>
        {opportunity.postedDate && (
          <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
            <Feather name="clock" size={18} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.md }]}>
              Posted: {opportunity.postedDate}
            </Text>
          </View>
        )}
        {opportunity.duration && (
          <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
            <Feather name="clock" size={18} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.md }]}>
              Duration: {opportunity.duration}
            </Text>
          </View>
        )}
        {opportunity.prizeAmount && (
          <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
            <Feather name="award" size={18} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.md }]}>
              Prize: {opportunity.prizeAmount}
            </Text>
          </View>
        )}
      </View>

      {opportunity.briefingDate && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Briefing Information</Text>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={18} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md, flex: 1 }]}>
              {opportunity.briefingDate}
            </Text>
          </View>
          {opportunity.briefingLocation && (
            <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md, flex: 1 }]}>
                {opportunity.briefingLocation}
              </Text>
            </View>
          )}
          {opportunity.briefingType && (
            <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
              <Feather name={opportunity.briefingType === 'Compulsory' ? 'alert-circle' : 'info'} size={18} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md, flex: 1 }]}>
                {opportunity.briefingType} Briefing
              </Text>
            </View>
          )}
        </View>
      )}


      {opportunity.sectors && opportunity.sectors.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Sectors / Themes</Text>
          {React.Children.toArray(
            opportunity.sectors.map((sector: string) => (
              <View style={styles.listItem}>
                <Feather name="target" size={18} color={colors.secondary} />
                <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>{sector}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {opportunity.eligibility && opportunity.eligibility.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Eligibility Requirements</Text>
          {React.Children.toArray(
            opportunity.eligibility.map((req: string) => (
              <View style={styles.listItem}>
                <Feather name="check-circle" size={18} color={colors.secondary} />
                <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>{req}</Text>
              </View>
            )))}
        </View>
      )}

      {opportunity.benefits && opportunity.benefits.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Benefits</Text>
          {React.Children.toArray(
            opportunity.benefits.map((benefit: string) => (
              <View style={styles.listItem}>
                <Feather name="star" size={18} color={colors.accent} />
                <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>{benefit}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {opportunity.type === 'Tenders' && (
        <>
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Tender Documents</Text>
            {opportunity.tenderAdvertUrl && (
              <Pressable onPress={handleDownloadTenderAdvert} style={({ pressed }) => [styles.downloadButton, { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1, marginBottom: Spacing.md }]}>
                <Feather name="download" size={18} color={colors.primary} />
                <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1, fontWeight: '600' }]}>
                  Download Full Detailed Advert (PDF)
                </Text>
              </Pressable>
            )}
            {opportunity.tenderDocumentsUrl && (
              <Pressable onPress={handleDownloadTenderDocuments} style={({ pressed }) => [styles.downloadButton, { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 }]}>
                <Feather name="download" size={18} color={colors.primary} />
                <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1, fontWeight: '600' }]}>
                  Download Tender Documents (ZIP)
                </Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>How to Apply for This Tender</Text>
            <Text style={[Typography.body, { color: colors.text, marginBottom: Spacing.md }]}>
              All tender submissions must be done through the ELIDZ Online Tender Portal. Follow these steps:
            </Text>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[Typography.caption, { color: colors.buttonText, fontWeight: '600' }]}>1</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Register on Tender Portal</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Create an account with your email, company name, and contact details
                </Text>
                <Pressable onPress={handleTenderPortalRegister} style={{ marginTop: Spacing.xs }}>
                  <Text style={[Typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                    Go to Registration Page →
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.stepItem, { marginTop: Spacing.md }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[Typography.caption, { color: colors.buttonText, fontWeight: '600' }]}>2</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Login to Portal</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Use your registered email and password to access the portal
                </Text>
                <Pressable onPress={handleTenderPortalLogin} style={{ marginTop: Spacing.xs }}>
                  <Text style={[Typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                    Go to Login Page →
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.stepItem, { marginTop: Spacing.md }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[Typography.caption, { color: colors.buttonText, fontWeight: '600' }]}>3</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Download Tender Documents</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Download the full detailed advert and tender documents using the links above
                </Text>
              </View>
            </View>
            <View style={[styles.stepItem, { marginTop: Spacing.md }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[Typography.caption, { color: colors.buttonText, fontWeight: '600' }]}>4</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Complete Required Documents</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Fill in all required forms and prepare your tender submission
                  </Text>
              </View>
            </View>
            <View style={[styles.stepItem, { marginTop: Spacing.md }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[Typography.caption, { color: colors.buttonText, fontWeight: '600' }]}>5</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Submit Tender Online</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Upload and submit your completed tender documents through the portal before the closing date
                </Text>
                <Pressable onPress={handleTenderPortalSubmit} style={{ marginTop: Spacing.xs }}>
                  <Text style={[Typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                    Go to Submit Tender Page →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Important Resources</Text>
            <Pressable onPress={handleDownloadUserGuide} style={({ pressed }) => [styles.resourceButton, { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1, marginBottom: Spacing.md }]}>
              <Feather name="book" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>
                  Online Tender Portal User Guide
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Step-by-step guide for registration and submission process
                </Text>
              </View>
              <Feather name="external-link" size={18} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDownloadProcurementHandbook} style={({ pressed }) => [styles.resourceButton, { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 }]}>
              <Feather name="file-text" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>
                  ELIDZ Procurement Handbook
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Complete procurement procedures and requirements
                </Text>
              </View>
              <Feather name="external-link" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Description</Text>
            <Text style={[Typography.body, { color: colors.text }]}>
              {opportunity.fullDescription || opportunity.description}
            </Text>
          </View>
        </>
      )}

      {opportunity.type !== 'Tenders' && (
        <>
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Description</Text>
            <Text style={[Typography.body, { color: colors.text }]}>
              {opportunity.fullDescription || opportunity.description}
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>How to Apply</Text>
            <Text style={[Typography.body, { color: colors.text }]}>
              {opportunity.howToApply || 'Please contact the organization for application details.'}
            </Text>
          </View>
        </>
      )}

      {(opportunity.contactEmail || opportunity.contactPhone) && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Contact Information</Text>
          {opportunity.contactEmail && (
            <Pressable onPress={handleContactEmail} style={styles.infoRow}>
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1, textDecorationLine: 'underline' }]}>
                {opportunity.contactEmail}
              </Text>
            </Pressable>
          )}
          {opportunity.contactPhone && (
            <Pressable onPress={handleContactPhone} style={[styles.infoRow, { marginTop: opportunity.contactEmail ? Spacing.md : 0 }]}>
              <Feather name="phone" size={18} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1, textDecorationLine: 'underline' }]}>
                {opportunity.contactPhone}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.applyButton,
          { backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleApplyNow}
      >
        <Text style={[Typography.body, { color: colors.buttonText, fontWeight: '600' }]}>
          {opportunity.type === 'Tenders'
            ? 'Go to Tender Portal'
            : opportunity.applicationUrl
              ? 'Apply Online'
              : 'Apply Now'}
        </Text>
      </Pressable>
    </ScreenScrollView>
  );
}

export default withAuthGuard(OpportunityDetailScreen);

const styles = StyleSheet.create({
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  applyButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
