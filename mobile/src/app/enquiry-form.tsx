import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { enquiryService, CreateEnquiryData } from '@/services/enquiry.service';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';

function EnquiryFormScreen() {
  const params = useLocalSearchParams<{
    type?: string;
    facilityId?: string;
    tenantId?: string;
    opportunityId?: string;
    subject?: string;
  }>();

  const [enquiryType, setEnquiryType] = useState<CreateEnquiryData['enquiry_type']>(
    (params.type as CreateEnquiryData['enquiry_type']) || 'General'
  );
  const [subject, setSubject] = useState(params.subject || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject for your enquiry');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please enter your message');
      return;
    }

    if (message.trim().length < 10) {
      Alert.alert('Validation Error', 'Please provide more details in your message (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const enquiryData: CreateEnquiryData = {
        enquiry_type: enquiryType,
        subject: subject.trim(),
        message: message.trim(),
        related_facility_id: params.facilityId || undefined,
        related_tenant_id: params.tenantId || undefined,
        related_opportunity_id: params.opportunityId || undefined,
      };

      await enquiryService.createEnquiry(enquiryData);

      Alert.alert(
        'Enquiry Submitted',
        'Your enquiry has been submitted successfully. We will get back to you soon!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      Alert.alert('Error', error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <LinearGradient
        colors={['#002147', '#003366']}
        className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
      >
        <View className="flex-row justify-between items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Submit Enquiry</Text>
          <HeaderAvatar />
        </View>
      </LinearGradient>

      <ScreenKeyboardAwareScrollView>
        <View className="px-6 py-6">
          {/* Enquiry Type */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Enquiry Type</Text>
            <View className="bg-input border border-border rounded-xl overflow-hidden">
              <Picker
                selectedValue={enquiryType}
                onValueChange={(value) => setEnquiryType(value)}
                style={{ color: '#002147' }}
                dropdownIconColor="#FF6600"
              >
                <Picker.Item label="General" value="General" color="#FF6600" />
                <Picker.Item label="Product Line" value="Product Line" color="#FF6600" />
                <Picker.Item label="Facility" value="Facility" color="#FF6600" />
                <Picker.Item label="Tenant" value="Tenant" color="#FF6600" />
                <Picker.Item label="Opportunity" value="Opportunity" color="#FF6600" />
                <Picker.Item label="Other" value="Other" color="#FF6600" />
              </Picker>
            </View>
          </View>

          {/* Subject */}
          <View className="mb-6">
            <Text className="text-foreground text-base font-semibold mb-2">Subject</Text>
            <View className="flex-row items-center bg-input rounded-xl px-4 h-14 border border-border">
              <Feather name="file-text" size={20} color="#FF6600" style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-base text-foreground h-full"
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter enquiry subject"
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
            disabled={isSubmitting || !subject.trim() || !message.trim() || message.trim().length < 10}
            className={`h-14 rounded-xl justify-center items-center mb-4 ${
              isSubmitting || !subject.trim() || !message.trim() || message.trim().length < 10
                ? 'bg-muted opacity-50'
                : 'bg-accent active:opacity-90'
            }`}
          >
            <View className="flex-row items-center">
              {isSubmitting ? (
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
    </View>
  );
}

export default withAuthGuard(EnquiryFormScreen);

