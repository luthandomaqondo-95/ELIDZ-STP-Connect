import React, { useEffect, useState } from 'react';
import { View, Pressable, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { ResourceService } from '@/services/resource.service';
import { enquiryService } from '@/services/enquiry.service';
import type { Resource } from '@/types';
import { TabsLayoutHeader } from '@/components/Header';

function ResourceDetailScreen() {
  const { colors } = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '',
    purpose: '',
    notes: '',
  });
  const [resource, setResource] = useState<Resource | null>(null);

  useEffect(() => {
    async function loadResource() {
      if (!id) return;
      try {
        const allResources = await ResourceService.getResources();
        const found = allResources.find((item) => item.id === id);
        setResource(found || null);
      } catch (error) {
        console.error('Error loading resource detail:', error);
        setResource(null);
      }
    }
    loadResource();
  }, [id]);

  const displayResource = {
    id: resource?.id || id,
    name: resource?.title || name || 'Resource',
    category: resource?.category || 'General',
    status: resource?.status || 'Available',
    fullDescription: resource?.description || 'Detailed information about this resource.',
    specifications: [] as string[],
    location: 'ELIDZ-STP',
    contact: 'info@elidz.co.za',
    bookingRequired: true,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return colors.success;
      case 'In Use': return colors.warning;
      case 'Upcoming': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Equipment': return 'tool';
      case 'Expertise': return 'award';
      case 'Labs': return 'activity';
      case 'Training': return 'book-open';
      default: return 'package';
    }
  };

  const handleRequestAccess = () => {
    setShowBookingModal(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBooking = async () => {
    if (!bookingData.date.trim() || !bookingData.time.trim() || !bookingData.purpose.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Date, Time, and Purpose)');
      return;
    }

    setIsSubmitting(true);
    try {
      const message = [
        `Resource: ${displayResource.name}`,
        `Preferred Date: ${bookingData.date.trim()}`,
        `Preferred Time: ${bookingData.time.trim()}`,
        `Duration: ${bookingData.duration.trim() || 'Not specified'}`,
        '',
        `Purpose: ${bookingData.purpose.trim()}`,
        '',
        `Additional Notes: ${bookingData.notes.trim() || 'None'}`,
      ].join('\n');

      await enquiryService.createEnquiry({
        enquiry_type: 'Other',
        subject: `Resource Booking Request: ${displayResource.name}`,
        message,
      });
      
      Alert.alert(
        'Booking Request Submitted',
        `Your request for ${displayResource.name} has been submitted successfully. You will receive a confirmation email shortly.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              setBookingData({ date: '', time: '', duration: '', purpose: '', notes: '' });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title={displayResource.name} variant="navy">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-xl items-center justify-center bg-white/10 mr-3 border border-white/10">
              <Feather name={getCategoryIcon(displayResource.category) as any} size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-base">{displayResource.category}</Text>
              <View className="flex-row items-center mt-1">
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(displayResource.status) }} />
                <Text className="text-white/80 text-sm ml-2">{displayResource.status}</Text>
              </View>
            </View>
          </View>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-5">
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Description</Text>
          <Text className="text-base text-foreground leading-6">
            {displayResource.fullDescription}
          </Text>
        </View>

        {displayResource.specifications && displayResource.specifications.length > 0 && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold mb-2.5">Specifications</Text>
            {displayResource.specifications.map((spec: string, index: number) => (
              <View key={`${index}-${spec}`} className="flex-row items-start mb-2.5">
                <Feather name="check-circle" size={18} color={colors.secondary} />
                <Text className="text-base ml-2.5 flex-1">
                  {spec}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold mb-2.5">Location & Contact</Text>
          <View className="flex-row items-center">
            <Feather name="map-pin" size={18} color={colors.textSecondary} />
            <Text className="text-base text-foreground ml-2.5">
              {displayResource.location}
            </Text>
          </View>
          <View className="flex-row items-center mt-2.5">
            <Feather name="mail" size={18} color={colors.textSecondary} />
            <Text className="text-base text-primary ml-2.5">
              {displayResource.contact}
            </Text>
          </View>
        </View>

        {displayResource.bookingRequired && (
          <Pressable
            className={`flex-row justify-center items-center h-[52px] rounded-lg mb-5 active:opacity-70 ${displayResource.status === 'Available' ? 'bg-accent' : 'bg-muted-foreground'}`}
            onPress={handleRequestAccess}
            disabled={displayResource.status !== 'Available'}
          >
            <Feather
              name={displayResource.status === 'Available' ? 'calendar' : 'clock'}
              size={20}
              color={colors.buttonText}
            />
            <Text className="text-base font-semibold text-primary-foreground ml-2.5">
              {displayResource.status === 'Available' ? 'Request Access' : displayResource.status === 'In Use' ? 'Currently In Use' : 'Coming Soon'}
            </Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-xl max-h-[90%]">
            <View className="flex-row justify-between items-center px-3 pt-3 pb-2.5 border-b border-border">
              <Text className="text-lg font-bold">Request Access</Text>
              <Pressable
                onPress={() => setShowBookingModal(false)}
                className="p-1 active:opacity-60"
              >
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              className="px-3 pt-3 pb-5"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-base text-muted-foreground mb-3">
                Please provide the following information to request access to {displayResource.name}
              </Text>

              <View className="mb-3">
                <Text className="text-sm font-semibold mb-2">Preferred Date *</Text>
                <TextInput
                  className="h-12 border border-border rounded-lg px-2.5 text-base bg-card text-foreground"
                  placeholder="e.g., 2025-01-15"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.date}
                  onChangeText={value => handleInputChange('date', value)}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-semibold mb-2">Preferred Time *</Text>
                <TextInput
                  className="h-12 border border-border rounded-lg px-2.5 text-base bg-card text-foreground"
                  placeholder="e.g., 09:00 AM"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.time}
                  onChangeText={value => handleInputChange('time', value)}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-semibold mb-2">Duration (Optional)</Text>
                <TextInput
                  className="h-12 border border-border rounded-lg px-2.5 text-base bg-card text-foreground"
                  placeholder="e.g., 2 hours"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.duration}
                  onChangeText={value => handleInputChange('duration', value)}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-semibold mb-2">Purpose *</Text>
                <TextInput
                  className="min-h-[100px] border border-border rounded-lg px-2.5 py-2.5 text-base bg-card text-foreground"
                  placeholder="Describe the purpose of your request..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={bookingData.purpose}
                  onChangeText={value => handleInputChange('purpose', value)}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-semibold mb-2">Additional Notes (Optional)</Text>
                <TextInput
                  className="min-h-[100px] border border-border rounded-lg px-2.5 py-2.5 text-base bg-card text-foreground"
                  placeholder="Any additional information..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={bookingData.notes}
                  onChangeText={value => handleInputChange('notes', value)}
                />
              </View>

              <Pressable
                className="flex-row justify-center items-center h-[52px] rounded-lg mt-2.5 mb-3 bg-accent active:opacity-70 disabled:opacity-70"
                onPress={handleSubmitBooking}
                disabled={isSubmitting}
              >
                <Feather name="send" size={20} color={colors.buttonText} />
                <Text className="text-base font-semibold text-primary-foreground ml-2.5">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

export default withAuthGuard(ResourceDetailScreen);

