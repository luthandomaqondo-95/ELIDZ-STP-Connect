import React, { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, Modal, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { enquiryService, CreateEnquiryData } from '@/services/enquiry.service';
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
  const [enquiryTypeModalVisible, setEnquiryTypeModalVisible] = useState(false);
  const [subject, setSubject] = useState(params.subject || '');
  const [message, setMessage] = useState('');

  // Optional booking-style fields (mainly for Facility enquiries)
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [duration, setDuration] = useState('');
  const [attendees, setAttendees] = useState('');
  const [requirements, setRequirements] = useState('');

  const enquiryTypeOptions: CreateEnquiryData['enquiry_type'][] = [
    'General',
    'Product Line',
    'Facility',
    'Tenant',
    'Opportunity',
    'Other',
  ];

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

    // For facility enquiries, prepend structured booking info into the message body
    const baseMessage = message.trim();
    const bookingInfoLines: string[] = [];
    if (enquiryType === 'Facility') {
      if (preferredDate.trim()) bookingInfoLines.push(`Preferred date: ${preferredDate.trim()}`);
      if (preferredTime.trim()) bookingInfoLines.push(`Preferred time: ${preferredTime.trim()}`);
      if (duration.trim()) bookingInfoLines.push(`Duration: ${duration.trim()}`);
      if (attendees.trim()) bookingInfoLines.push(`Estimated attendees: ${attendees.trim()}`);
      if (requirements.trim()) bookingInfoLines.push(`Facility / equipment needed: ${requirements.trim()}`);
    }
    const finalMessage =
      bookingInfoLines.length > 0
        ? `${bookingInfoLines.join('\n')}\n\n${baseMessage}`
        : baseMessage;

    await execute(
      () => {
        const enquiryData: CreateEnquiryData = {
          enquiry_type: enquiryType,
          subject: subject.trim(),
          message: finalMessage,
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
          <TabsLayoutHeader title="Submit Enquiry" variant="navy" showBackButton>
            <Text className="text-white/80 text-base">
              Send us your questions or requests.
            </Text>
          </TabsLayoutHeader>
        </View>

        <View className="mt-6 px-6">
          {/* Enquiry Type */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Enquiry Type</Text>
            <Pressable
              className="flex-row items-center bg-input border border-border rounded-xl px-4 h-14"
              onPress={() => setEnquiryTypeModalVisible(true)}
            >
              <View className="flex-1">
                <Text className="text-base" style={{ color: colors.text }}>
                  {enquiryType || 'Select enquiry type'}
                </Text>
              </View>
              <Feather name="chevron-down" size={18} color={colors.textSecondary} />
            </Pressable>

            {/* Enquiry Type Modal (NativeWind-styled, dark-mode aware) */}
            <Modal
              visible={enquiryTypeModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setEnquiryTypeModalVisible(false)}
            >
              <Pressable
                className="flex-1 bg-black/50 justify-end"
                onPress={() => setEnquiryTypeModalVisible(false)}
              >
                <Pressable
                  className="bg-card border-t border-border rounded-t-2xl max-h-[70%]"
                  onPress={(e) => e.stopPropagation()}
                >
                  <View className="p-4 border-b border-border">
                    <Text className="text-lg font-semibold text-foreground">
                      Select enquiry type
                    </Text>
                  </View>
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={enquiryTypeOptions}
                    keyExtractor={(item) => item}
                    className="max-h-[280px]"
                    renderItem={({ item }) => (
                      <Pressable
                        className="px-4 py-3 active:bg-muted"
                        onPress={() => {
                          setEnquiryType(item);
                          setEnquiryTypeModalVisible(false);
                        }}
                      >
                        <Text
                          className="text-base"
                          style={{ color: item === enquiryType ? colors.accent : colors.text }}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    )}
                  />
                </Pressable>
              </Pressable>
            </Modal>
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

          {/* Extra booking details for Facility enquiries */}
          {enquiryType === 'Facility' && (
            <View className="mb-6">
              <Text className="text-foreground text-base font-semibold mb-2">
                Booking Details (optional)
              </Text>
              <View className="mb-3">
                <Text className="text-xs text-muted-foreground mb-1">
                  Help us understand when and how you&apos;d like to use the facility.
                </Text>
              </View>
              <View className="mb-3 flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-foreground text-xs font-semibold mb-1">Preferred date</Text>
                  <View className="bg-input rounded-xl px-3 h-11 border border-border flex-row items-center">
                    <Feather name="calendar" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                    <TextInput
                      className="flex-1 text-sm text-foreground"
                      value={preferredDate}
                      onChangeText={setPreferredDate}
                      placeholder="e.g. 25 March 2026"
                      placeholderTextColor={colors.placeholder}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-xs font-semibold mb-1">Preferred time</Text>
                  <View className="bg-input rounded-xl px-3 h-11 border border-border flex-row items-center">
                    <Feather name="clock" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                    <TextInput
                      className="flex-1 text-sm text-foreground"
                      value={preferredTime}
                      onChangeText={setPreferredTime}
                      placeholder="e.g. 10:00 - 12:00"
                      placeholderTextColor={colors.placeholder}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-foreground text-xs font-semibold mb-1">Estimated duration</Text>
                <View className="bg-input rounded-xl px-3 h-11 border border-border flex-row items-center">
                  <Feather name="activity" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-sm text-foreground"
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="e.g. 2 hours"
                    placeholderTextColor={colors.placeholder}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-foreground text-xs font-semibold mb-1">
                  Number of people attending
                </Text>
                <View className="bg-input rounded-xl px-3 h-11 border border-border flex-row items-center">
                  <Feather name="users" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-sm text-foreground"
                    value={attendees}
                    onChangeText={setAttendees}
                    placeholder="e.g. 10"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad"
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <View className="mb-1">
                <Text className="text-foreground text-xs font-semibold mb-1">
                  Facility / equipment requirements
                </Text>
                <View className="bg-input rounded-xl px-3 py-3 border border-border min-h-[64px]">
                  <TextInput
                    className="flex-1 text-sm text-foreground"
                    value={requirements}
                    onChangeText={setRequirements}
                    placeholder="e.g. lab access, auditorium, projector, internet, catering"
                    placeholderTextColor={colors.placeholder}
                    multiline
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>
          )}

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
              <Feather
                name="info"
                size={20}
                color={colors.primary}
                style={{ marginRight: 12, marginTop: 2 }}
              />
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

