import React, { useEffect, useState } from 'react';
import { View, Pressable, Linking, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types';
import { TabsLayoutHeader } from '@/components/Header';

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
       <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
         <View className="bg-background">
           <TabsLayoutHeader title="Opportunity" variant="navy">
             <Text className="text-white/80 text-base">
               Details and application info.
             </Text>
           </TabsLayoutHeader>
         </View>
         <View className="p-5 items-center justify-center min-h-[300px]">
           <ActivityIndicator size="large" color={colors.primary} />
         </View>
       </ScreenScrollView>
     );
  }

  if (!opportunity) {
    return (
      <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader title="Opportunity" variant="navy">
            <Text className="text-white/80 text-base">
              Details and application info.
            </Text>
          </TabsLayoutHeader>
        </View>
        <View className="mt-6 px-5">
          <Text className="text-lg font-bold text-center mt-5">
            Opportunity not found
          </Text>
          <Pressable
            className="mt-3 p-3 rounded-lg bg-primary active:opacity-70 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-primary-foreground">
              Go Back
            </Text>
          </Pressable>
        </View>
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
      Linking.openURL('https://tenderportal.elidz.co.za/');
    } else if (opportunity.applicationUrl) {
      Linking.openURL(opportunity.applicationUrl);
    } else {
      // Fallback: take user to the ELIDZ Science & Technology Park website
      Linking.openURL('https://www.elidzstp.co.za');
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
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Opportunity" variant="navy">
          <Text className="text-white/80 text-base" numberOfLines={1}>
            {opportunity.type} • {opportunity.org || 'ELIDZ'}
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-5">
        <View className="p-5 rounded-xl mb-3" style={{ backgroundColor: typeColors[opportunity.type] || colors.primary }}>
        <View className="flex-row items-center self-start px-2.5 py-2 rounded-lg bg-primary-foreground">
          <Feather name={getTypeIcon(opportunity.type) as any} size={16} color={typeColors[opportunity.type] || colors.primary} />
          <Text className="text-sm ml-1" style={{ color: typeColors[opportunity.type] || colors.primary }}>
            {opportunity.type}
          </Text>
        </View>
        <Text className="text-xl font-bold text-primary-foreground mt-3">
          {opportunity.title}
        </Text>
        <Text className="text-base text-primary-foreground/90 mt-2">
          {opportunity.org}
        </Text>
      </View>

      <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
        {opportunity.reference && (
          <View className="flex-row items-center">
            <Feather name="hash" size={18} color={colors.textSecondary} />
            <Text className="text-sm text-muted-foreground ml-2.5">
              Reference: {opportunity.reference}
            </Text>
          </View>
        )}
        <View className={`flex-row items-center ${opportunity.reference ? 'mt-2.5' : ''}`}>
          <Feather name="calendar" size={18} color={colors.textSecondary} />
          <Text className="text-sm text-muted-foreground ml-2.5">
            Deadline: {opportunity.deadline}
          </Text>
        </View>
        {opportunity.postedDate && (
          <View className="flex-row items-center mt-2.5">
            <Feather name="clock" size={18} color={colors.textSecondary} />
            <Text className="text-sm text-muted-foreground ml-2.5">
              Posted: {opportunity.postedDate}
            </Text>
          </View>
        )}
        {opportunity.duration && (
          <View className="flex-row items-center mt-2.5">
            <Feather name="clock" size={18} color={colors.textSecondary} />
            <Text className="text-sm text-muted-foreground ml-2.5">
              Duration: {opportunity.duration}
            </Text>
          </View>
        )}
        {opportunity.prizeAmount && (
          <View className="flex-row items-center mt-2.5">
            <Feather name="award" size={18} color={colors.textSecondary} />
            <Text className="text-sm text-muted-foreground ml-2.5">
              Prize: {opportunity.prizeAmount}
            </Text>
          </View>
        )}
      </View>

      {opportunity.briefingDate && (
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Briefing Information</Text>
          <View className="flex-row items-center">
            <Feather name="calendar" size={18} color={colors.textSecondary} />
            <Text className="text-base text-foreground ml-2.5 flex-1">
              {opportunity.briefingDate}
            </Text>
          </View>
          {opportunity.briefingLocation && (
            <View className="flex-row items-center mt-2.5">
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <Text className="text-base text-foreground ml-2.5 flex-1">
                {opportunity.briefingLocation}
              </Text>
            </View>
          )}
          {opportunity.briefingType && (
            <View className="flex-row items-center mt-2.5">
              <Feather name={opportunity.briefingType === 'Compulsory' ? 'alert-circle' : 'info'} size={18} color={colors.textSecondary} />
              <Text className="text-base text-foreground ml-2.5 flex-1">
                {opportunity.briefingType} Briefing
              </Text>
            </View>
          )}
        </View>
      )}


      {opportunity.sectors && opportunity.sectors.length > 0 && (
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Sectors / Themes</Text>
          {opportunity.sectors.map((sector: string, index: number) => (
            <View key={`sector-${index}`} className="flex-row items-start mb-2.5">
              <Feather name="target" size={18} color={colors.secondary} />
              <Text className="text-base ml-2.5 flex-1">{sector}</Text>
            </View>
          ))}
        </View>
      )}

      {opportunity.eligibility && opportunity.eligibility.length > 0 && (
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Eligibility Requirements</Text>
          {opportunity.eligibility.map((req: string, index: number) => (
            <View key={`eligibility-${index}`} className="flex-row items-start mb-2.5">
              <Feather name="check-circle" size={18} color={colors.secondary} />
              <Text className="text-base ml-2.5 flex-1">{req}</Text>
            </View>
          ))}
        </View>
      )}

      {opportunity.benefits && opportunity.benefits.length > 0 && (
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Benefits</Text>
          {opportunity.benefits.map((benefit: string, index: number) => (
            <View key={`benefit-${index}`} className="flex-row items-start mb-2.5">
              <Feather name="star" size={18} color={colors.accent} />
              <Text className="text-base ml-2.5 flex-1">{benefit}</Text>
            </View>
          ))}
        </View>
      )}

      {opportunity.type === 'Tenders' && (
        <>
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">Tender Documents</Text>
            {opportunity.tenderAdvertUrl && (
              <Pressable onPress={handleDownloadTenderAdvert} className="flex-row items-center p-2.5 rounded-lg bg-muted active:opacity-70 mb-2.5">
                <Feather name="download" size={18} color={colors.primary} />
                <Text className="text-base text-primary ml-2.5 flex-1 font-semibold">
                  Download Full Detailed Advert (PDF)
                </Text>
              </Pressable>
            )}
            {opportunity.tenderDocumentsUrl && (
              <Pressable onPress={handleDownloadTenderDocuments} className="flex-row items-center p-2.5 rounded-lg bg-muted active:opacity-70">
                <Feather name="download" size={18} color={colors.primary} />
                <Text className="text-base text-primary ml-2.5 flex-1 font-semibold">
                  Download Tender Documents (ZIP)
                </Text>
              </Pressable>
            )}
          </View>

          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">How to Apply for This Tender</Text>
            <Text className="text-base text-foreground mb-2.5">
              All tender submissions must be done through the ELIDZ Online Tender Portal. Follow these steps:
            </Text>
            <View className="flex-row items-start">
              <View className="w-7 h-7 rounded-full justify-center items-center bg-primary">
                <Text className="text-sm font-semibold text-primary-foreground">1</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-foreground">Register on Tender Portal</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Create an account with your email, company name, and contact details
                </Text>
                <Pressable onPress={handleTenderPortalRegister} className="mt-1">
                  <Text className="text-base text-primary underline">
                    Go to Registration Page →
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-row items-start mt-2.5">
              <View className="w-7 h-7 rounded-full justify-center items-center bg-primary">
                <Text className="text-sm font-semibold text-primary-foreground">2</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-foreground">Login to Portal</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Use your registered email and password to access the portal
                </Text>
                <Pressable onPress={handleTenderPortalLogin} className="mt-1">
                  <Text className="text-base text-primary underline">
                    Go to Login Page →
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-row items-start mt-2.5">
              <View className="w-7 h-7 rounded-full justify-center items-center bg-primary">
                <Text className="text-sm font-semibold text-primary-foreground">3</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-foreground">Download Tender Documents</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Download the full detailed advert and tender documents using the links above
                </Text>
              </View>
            </View>
            <View className="flex-row items-start mt-2.5">
              <View className="w-7 h-7 rounded-full justify-center items-center bg-primary">
                <Text className="text-sm font-semibold text-primary-foreground">4</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-foreground">Complete Required Documents</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Fill in all required forms and prepare your tender submission
                </Text>
              </View>
            </View>
            <View className="flex-row items-start mt-2.5">
              <View className="w-7 h-7 rounded-full justify-center items-center bg-primary">
                <Text className="text-sm font-semibold text-primary-foreground">5</Text>
              </View>
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-foreground">Submit Tender Online</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Upload and submit your completed tender documents through the portal before the closing date
                </Text>
                <Pressable onPress={handleTenderPortalSubmit} className="mt-1">
                  <Text className="text-base text-primary underline">
                    Go to Submit Tender Page →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">Important Resources</Text>
            <Pressable onPress={handleDownloadUserGuide} className="flex-row items-center p-2.5 rounded-lg bg-muted active:opacity-70 mb-2.5">
              <Feather name="book" size={18} color={colors.primary} />
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-primary">
                  Online Tender Portal User Guide
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Step-by-step guide for registration and submission process
                </Text>
              </View>
              <Feather name="external-link" size={18} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDownloadProcurementHandbook} className="flex-row items-center p-2.5 rounded-lg bg-muted active:opacity-70">
              <Feather name="file-text" size={18} color={colors.primary} />
              <View className="flex-1 ml-2.5">
                <Text className="text-base font-semibold text-primary">
                  ELIDZ Procurement Handbook
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Complete procurement procedures and requirements
                </Text>
              </View>
              <Feather name="external-link" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">Description</Text>
            <Text className="text-base text-foreground">
              {opportunity.fullDescription || opportunity.description}
            </Text>
          </View>
        </>
      )}

      {opportunity.type !== 'Tenders' && (
        <>
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">Description</Text>
            <Text className="text-base text-foreground">
              {opportunity.fullDescription || opportunity.description}
            </Text>
          </View>
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">How to Apply</Text>
            <Text className="text-base text-foreground">
              {opportunity.howToApply || 'Please contact the organization for application details.'}
            </Text>
          </View>
        </>
      )}

      {(opportunity.contactEmail || opportunity.contactPhone) && (
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Contact Information</Text>
          {opportunity.contactEmail && (
            <Pressable onPress={handleContactEmail} className="flex-row items-center">
              <Feather name="mail" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2.5 flex-1 underline">
                {opportunity.contactEmail}
              </Text>
            </Pressable>
          )}
          {opportunity.contactPhone && (
            <Pressable onPress={handleContactPhone} className={`flex-row items-center ${opportunity.contactEmail ? 'mt-2.5' : ''}`}>
              <Feather name="phone" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2.5 flex-1 underline">
                {opportunity.contactPhone}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <Pressable
        className="h-[52px] rounded-lg justify-center items-center mb-5 bg-accent active:opacity-70"
        onPress={handleApplyNow}
      >
        <View className="flex-row items-center">
          <Feather name="external-link" size={18} color={colors.buttonText} style={{ marginRight: 8 }} />
          <Text className="text-base font-semibold text-primary-foreground">
            {opportunity.type === 'Tenders'
              ? 'Go to Tender Portal'
              : opportunity.applicationUrl
                ? 'Apply on Website'
                : 'Visit Science & Technology Park Website'}
          </Text>
        </View>
      </Pressable>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(OpportunityDetailScreen);
