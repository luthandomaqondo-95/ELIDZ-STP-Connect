import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { ResourceService } from '@/services/resource.service';
import { enquiryService } from '@/services/enquiry.service';
import type { Resource } from '@/types';

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
    <ScreenScrollView>
      <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
        <View style={styles.iconContainer}>
          <Feather name={getCategoryIcon(displayResource.category) as any} size={48} color={colors.buttonText} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.buttonText }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(displayResource.status) }]} />
          <Text style={[Typography.small, { color: getStatusColor(displayResource.status), marginLeft: Spacing.xs }]}>
            {displayResource.status}
          </Text>
        </View>
        <Text style={[Typography.h2, { color: colors.buttonText, marginTop: Spacing.lg }]}>
          {displayResource.name}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.whiteOpacity20, marginTop: Spacing.sm }]}>
          <Text style={[Typography.small, { color: colors.buttonText }]}>{displayResource.category}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Description</Text>
        <Text style={[Typography.body, { color: colors.text, lineHeight: 24 }]}>
          {displayResource.fullDescription}
        </Text>
      </View>

      {displayResource.specifications && displayResource.specifications.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Specifications</Text>
          {displayResource.specifications.map((spec: string, index: number) => (
            <View key={`${index}-${spec}`} style={styles.specItem}>
              <Feather name="check-circle" size={18} color={colors.secondary} />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>
                {spec}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Location & Contact</Text>
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={18} color={colors.textSecondary} />
          <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
            {displayResource.location}
          </Text>
        </View>
        <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
          <Feather name="mail" size={18} color={colors.textSecondary} />
          <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md }]}>
            {displayResource.contact}
          </Text>
        </View>
      </View>

      {displayResource.bookingRequired && (
        <Pressable
          style={({ pressed }) => [
            styles.requestButton,
            { 
              backgroundColor: displayResource.status === 'Available' ? colors.accent : colors.textSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleRequestAccess}
          disabled={displayResource.status !== 'Available'}
        >
          <Feather 
            name={displayResource.status === 'Available' ? 'calendar' : 'clock'} 
            size={20} 
            color={colors.buttonText} 
          />
          <Text style={[Typography.body, { color: colors.buttonText, marginLeft: Spacing.md, fontWeight: '600' }]}>
            {displayResource.status === 'Available' ? 'Request Access' : displayResource.status === 'In Use' ? 'Currently In Use' : 'Coming Soon'}
          </Text>
        </Pressable>
      )}

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.backgroundRoot }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[Typography.h3]}>Request Access</Text>
              <Pressable
                onPress={() => setShowBookingModal(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
                Please provide the following information to request access to {displayResource.name}
              </Text>

              <View style={styles.formGroup}>
                <Text style={[Typography.caption, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
                  Preferred Date *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundDefault,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., 2025-01-15"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.date}
                  onChangeText={value => handleInputChange('date', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[Typography.caption, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
                  Preferred Time *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundDefault,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., 09:00 AM"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.time}
                  onChangeText={value => handleInputChange('time', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[Typography.caption, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
                  Duration (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundDefault,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., 2 hours"
                  placeholderTextColor={colors.textSecondary}
                  value={bookingData.duration}
                  onChangeText={value => handleInputChange('duration', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[Typography.caption, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
                  Purpose *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.backgroundDefault,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Describe the purpose of your request..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={bookingData.purpose}
                  onChangeText={value => handleInputChange('purpose', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[Typography.caption, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
                  Additional Notes (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.backgroundDefault,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Any additional information..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={bookingData.notes}
                  onChangeText={value => handleInputChange('notes', value)}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: isSubmitting || pressed ? 0.7 : 1,
                  },
                ]}
                onPress={handleSubmitBooking}
                disabled={isSubmitting}
              >
                <Feather name="send" size={20} color={colors.buttonText} />
                <Text style={[Typography.body, { color: colors.buttonText, marginLeft: Spacing.md, fontWeight: '600' }]}>
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

const styles = StyleSheet.create({
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.button,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
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
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  requestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.card,
    borderTopRightRadius: BorderRadius.card,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
});

export default withAuthGuard(ResourceDetailScreen);

