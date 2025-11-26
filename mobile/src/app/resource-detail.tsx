import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';

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

  // Mock data - in production, fetch from Supabase based on id
  const resources: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Environmental Testing Chamber',
      category: 'Equipment',
      status: 'Available',
      description: 'Temperature and humidity controlled testing',
      fullDescription: 'Our state-of-the-art environmental testing chamber provides precise control over temperature and humidity conditions, making it ideal for testing products, materials, and components under various environmental conditions.',
      specifications: [
        'Temperature range: -40°C to +150°C',
        'Humidity range: 10% to 98% RH',
        'Chamber volume: 1000L',
        'Programmable test cycles',
        'Data logging capabilities',
      ],
      location: 'Testing Lab, Building A',
      contact: 'facilities@elidz.co.za',
      bookingRequired: true,
    },
    '2': {
      id: '2',
      name: 'Food Safety Consultant',
      category: 'Expertise',
      status: 'Available',
      description: 'HACCP and food safety compliance',
      fullDescription: 'Expert consultation services for food safety compliance, HACCP implementation, and regulatory guidance. Our certified consultants help businesses navigate food safety regulations and implement best practices.',
      specifications: [
        'HACCP certification support',
        'Food safety audits',
        'Regulatory compliance guidance',
        'Training programs available',
        'ISO 22000 implementation',
      ],
      location: 'Consulting Office, Main Building',
      contact: 'consulting@elidz.co.za',
      bookingRequired: true,
    },
    '3': {
      id: '3',
      name: '3D Printing Station',
      category: 'Equipment',
      status: 'In Use',
      description: 'Industrial-grade 3D printers',
      fullDescription: 'Access to professional-grade 3D printing equipment for rapid prototyping and small-batch production. Multiple materials and technologies available.',
      specifications: [
        'FDM and SLA printing',
        'Multiple material options',
        'High-resolution printing',
        'Post-processing equipment',
        'Design consultation available',
      ],
      location: 'Prototyping Lab, Building B',
      contact: 'prototyping@elidz.co.za',
      bookingRequired: true,
    },
    '4': {
      id: '4',
      name: 'Water Quality Analysis',
      category: 'Labs',
      status: 'Available',
      description: 'Chemical and microbiological testing',
      fullDescription: 'Comprehensive water quality testing services including chemical analysis, microbiological testing, and compliance verification for various standards.',
      specifications: [
        'Chemical composition analysis',
        'Microbiological testing',
        'Heavy metal detection',
        'pH and conductivity testing',
        'Compliance reporting',
      ],
      location: 'Testing Lab, Building A',
      contact: 'testing@elidz.co.za',
      bookingRequired: true,
    },
    '5': {
      id: '5',
      name: 'CAD Design Workshop',
      category: 'Training',
      status: 'Upcoming',
      description: 'Learn professional CAD software',
      fullDescription: 'Comprehensive training program covering professional CAD software for product design and engineering. Suitable for beginners and intermediate users.',
      specifications: [
        'Hands-on training sessions',
        'Industry-standard software',
        'Project-based learning',
        'Certificate of completion',
        'Ongoing support available',
      ],
      location: 'Training Center, Main Building',
      contact: 'training@elidz.co.za',
      bookingRequired: true,
    },
  };

  const resource = resources[id] || {
    id,
    name,
    category: 'Equipment',
    status: 'Available',
    description: 'Resource details',
    fullDescription: 'Detailed information about this resource.',
    specifications: [],
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
      // Simulate API call - in production, this would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Booking Request Submitted',
        `Your request for ${resource.name} has been submitted successfully. You will receive a confirmation email shortly.`,
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
          <Feather name={getCategoryIcon(resource.category) as any} size={48} color={colors.buttonText} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.buttonText }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(resource.status) }]} />
          <Text style={[Typography.small, { color: getStatusColor(resource.status), marginLeft: Spacing.xs }]}>
            {resource.status}
          </Text>
        </View>
        <Text style={[Typography.h2, { color: colors.buttonText, marginTop: Spacing.lg }]}>
          {resource.name}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)', marginTop: Spacing.sm }]}>
          <Text style={[Typography.small, { color: colors.buttonText }]}>{resource.category}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Description</Text>
        <Text style={[Typography.body, { color: colors.text, lineHeight: 24 }]}>
          {resource.fullDescription}
        </Text>
      </View>

      {resource.specifications && resource.specifications.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Specifications</Text>
          {resource.specifications.map((spec: string, index: number) => (
            <View style={styles.specItem}>
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
            {resource.location}
          </Text>
        </View>
        <View style={[styles.infoRow, { marginTop: Spacing.md }]}>
          <Feather name="mail" size={18} color={colors.textSecondary} />
          <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md }]}>
            {resource.contact}
          </Text>
        </View>
      </View>

      {resource.bookingRequired && (
        <Pressable
          style={({ pressed }) => [
            styles.requestButton,
            { 
              backgroundColor: resource.status === 'Available' ? colors.accent : colors.textSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleRequestAccess}
          disabled={resource.status !== 'Available'}
        >
          <Feather 
            name={resource.status === 'Available' ? 'calendar' : 'clock'} 
            size={20} 
            color={colors.buttonText} 
          />
          <Text style={[Typography.body, { color: colors.buttonText, marginLeft: Spacing.md, fontWeight: '600' }]}>
            {resource.status === 'Available' ? 'Request Access' : resource.status === 'In Use' ? 'Currently In Use' : 'Coming Soon'}
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
                Please provide the following information to request access to {resource.name}
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

