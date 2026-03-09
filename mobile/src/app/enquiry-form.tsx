import React, { useState } from 'react';
import { View, TextInput, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { enquiryService, CreateEnquiryData } from '@/services/enquiry.service';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { TabsLayoutHeader } from '@/components/Header';
import { ErrorAlert } from '@/components/Error';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

function EnquiryFormScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const params = useLocalSearchParams<{
    type?: string;
    facilityId?: string;
    tenantId?: string;
    opportunityId?: string;
    subject?: string;
  }>();
  const { isLoading, error, errorTitle, execute, clearError, setError, isSubmitting } = useAsyncOperation();

  const [enquiryType, setEnquiryType] = useState<CreateEnquiryData['enquiry_type']>(
    (params.type as CreateEnquiryData['enquiry_type']) || 'General'
  );
  const [subject, setSubject] = useState(params.subject || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject for your enquiry', 'Validation Error');
      return;
    }

    if (!message.trim()) {
      setError('Please enter your message', 'Validation Error');
      return;
    }

    if (message.trim().length < 10) {
      setError('Please provide more details in your message (at least 10 characters)', 'Message Too Short');
      return;
    }

    await execute(
      () => {
        const enquiryData: CreateEnquiryData = {
          enquiry_type: enquiryType,
          subject: subject.trim(),
          message: message.trim(),
          related_facility_id: params.facilityId || undefined,
          related_tenant_id: params.tenantId || undefined,
          related_opportunity_id: params.opportunityId || undefined,
        };
        return enquiryService.createEnquiry(enquiryData);
      },
      {
        onSuccess: () => {
          setError('Your enquiry has been submitted successfully. We will get back to you soon!', 'Enquiry Submitted', 'info');
          setTimeout(() => {
            router.back();
          }, 2000);
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenKeyboardAwareScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader
            title="Submit Enquiry"
            variant="navy"
            left={
              <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
                <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
            }
          >
            <Text className="text-white/80 text-base">
              Send us your questions or requests.
            </Text>
          </TabsLayoutHeader>
        </View>

        <View className="mt-6 px-6">
          {/* Enquiry Type */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Enquiry Type</Text>
            <View className="bg-input border border-border rounded-xl overflow-hidden">
              <Picker
                selectedValue={enquiryType}
                onValueChange={(value) => setEnquiryType(value)}
                style={{ color: '#002147' }}
                dropdownIconColor="#F38C1E"
              >
                <Picker.Item label="General" value="General" color={colors.accent} />
                <Picker.Item label="Product Line" value="Product Line" color={colors.accent} />
                <Picker.Item label="Facility" value="Facility" color={colors.accent} />
                <Picker.Item label="Tenant" value="Tenant" color={colors.accent} />
                <Picker.Item label="Opportunity" value="Opportunity" color={colors.accent} />
                <Picker.Item label="Other" value="Other" color={colors.accent} />
              </Picker>
            </View>
          </View>

          {/* Subject */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Subject</Text>
            <View className="flex-row items-center bg-input rounded-xl px-4 h-14 border border-border">
              <Feather name="file-text" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-base text-foreground h-full"
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter enquiry subject"
                placeholderTextColor={colors.placeholder}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Message */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Message</Text>
            <View className="bg-input rounded-xl px-4 py-4 border border-border min-h-[200px]">
              <TextInput
                className="flex-1 text-base text-foreground"
                value={message}
                onChangeText={setMessage}
                placeholder="Please provide details about your enquiry..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>
            <Text className="text-muted-foreground text-xs mt-2">
              {message.length} characters (minimum 10 required)
            </Text>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading || !subject.trim() || !message.trim() || message.trim().length < 10}
            className={`h-14 rounded-xl justify-center items-center mb-4 ${
              isLoading || !subject.trim() || !message.trim() || message.trim().length < 10
                ? 'bg-muted opacity-50'
                : 'bg-accent active:opacity-90'
            }`}
          >
            <View className="flex-row items-center">
              {isLoading ? (
                <>
                  <Feather name="loader" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-lg font-bold">Submitting...</Text>
                </>
              ) : (
                <>
                  <Feather name="send" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-lg font-bold">Submit Enquiry</Text>
                </>
              )}
            </View>
          </Pressable>

          {/* Info */}
          <View className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <View className="flex-row items-start">
              <Feather name="info" size={20} color="#002147" style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-foreground text-sm font-semibold mb-1">What happens next?</Text>
                <Text className="text-muted-foreground text-xs leading-5">
                  Your enquiry will be reviewed by our team. We typically respond within 1-2 business days. 
                  You can track the status of your enquiry in your profile.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScreenKeyboardAwareScrollView>

      {/* Error Alert */}
      <ErrorAlert
        visible={!!error}
        title={errorTitle}
        message={error ?? ''}
        onDismiss={clearError}
        severity="error"
        autoDismissMs={error?.includes('submitted') ? 2000 : 5000}
      />
    </View>
  );
}

export default withAuthGuard(EnquiryFormScreen);

