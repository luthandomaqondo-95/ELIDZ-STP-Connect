import React, { useState } from 'react';
import { View, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '../components/ScreenKeyboardAwareScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';

function ApplicationFormScreen() {
  const params = useLocalSearchParams<{ opportunityTitle?: string; opportunityId?: string }>();
  const opportunityTitle = params.opportunityTitle;
  const opportunityId = params.opportunityId;
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Success', 'Your application has been submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View className="bg-primary p-6 rounded-xl mb-4">
        <Text className="text-2xl font-bold text-white">
          Apply Now
        </Text>
        <Text className="text-base text-white/90 mt-2">
          {opportunityTitle || 'Submit your application'}
        </Text>
      </View>

      <View className="bg-card p-4 rounded-xl mb-4 shadow-sm">
        <Text className="text-lg font-bold mb-4">
          Application Details
        </Text>

        <View className="mb-4">
          <Text className="text-sm mb-2 font-semibold">
            Full Name *
          </Text>
          <TextInput
            className="border border-border rounded-lg px-3 py-3 text-sm bg-popover text-foreground"
            placeholder="Enter your full name"
            placeholderTextColor="rgb(153, 153, 158)"
            value={formData.fullName}
            onChangeText={value => handleInputChange('fullName', value)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-2 font-semibold">
            Email Address *
          </Text>
          <TextInput
            className="border border-border rounded-lg px-3 py-3 text-sm bg-popover text-foreground"
            placeholder="Enter your email"
            placeholderTextColor="rgb(153, 153, 158)"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-2 font-semibold">
            Phone Number *
          </Text>
          <TextInput
            className="border border-border rounded-lg px-3 py-3 text-sm bg-popover text-foreground"
            placeholder="Enter your phone number"
            placeholderTextColor="rgb(153, 153, 158)"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={value => handleInputChange('phone', value)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-2 font-semibold">
            Organization
          </Text>
          <TextInput
            className="border border-border rounded-lg px-3 py-3 text-sm bg-popover text-foreground"
            placeholder="Enter your organization name"
            placeholderTextColor="rgb(153, 153, 158)"
            value={formData.organization}
            onChangeText={value => handleInputChange('organization', value)}
          />
        </View>

        <View className="mb-0">
          <Text className="text-sm mb-2 font-semibold">
            Additional Information
          </Text>
          <TextInput
            className="border border-border rounded-lg px-3 py-3 text-sm bg-popover text-foreground"
            placeholder="Tell us more about your project or application"
            placeholderTextColor="rgb(153, 153, 158)"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
          />
        </View>
      </View>

      <Pressable
        className={`h-13 rounded-lg justify-center items-center flex-row mb-3 bg-primary ${isSubmitting ? 'opacity-70' : ''}`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Feather name="send" size={20} color="#FFFFFF" className="mr-2" />
        <Text className="text-base text-white font-semibold">
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Text>
      </Pressable>

      <Pressable
        className="h-13 rounded-lg justify-center items-center mb-6 border border-border"
        onPress={() => router.back()}
      >
        <Text className="text-base text-foreground">
          Cancel
        </Text>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

export default withAuthGuard(ApplicationFormScreen);
