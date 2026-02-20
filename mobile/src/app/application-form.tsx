import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { OpportunityService } from '@/services/opportunity.service';
import { TabsLayoutHeader } from '@/components/Header';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { cn } from '@/lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ApplicationFormScreen() {
  const params = useLocalSearchParams<{ opportunityTitle?: string; opportunityId?: string }>();
  const opportunityTitle = params.opportunityTitle;
  const opportunityId = params.opportunityId;
  const { profile } = useAuthContext();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.name ?? prev.fullName,
        email: profile.email ?? prev.email,
        organization: profile.organization ?? prev.organization,
      }));
    }
  }, [profile?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number.');
      return;
    }

    if (!opportunityId) {
      Alert.alert('Error', 'No opportunity selected. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const coverLetter = [
        `Name: ${formData.fullName.trim()}`,
        `Email: ${formData.email.trim()}`,
        `Phone: ${formData.phone.trim()}`,
        `Organization: ${formData.organization.trim() || 'N/A'}`,
        '',
        'Additional Information:',
        formData.description.trim() || 'N/A',
      ].join('\n');

      await OpportunityService.applyToOpportunity(opportunityId, coverLetter);
      
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
    <ScreenKeyboardAwareScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader
          title="Apply Now"
          variant="navy"
          showActions={false}
          left={
            <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full active:opacity-80">
              <Feather name="arrow-left" size={20} color="white" />
            </Pressable>
          }
        >
          <Text className="text-white/80 text-base" numberOfLines={2}>
            {opportunityTitle || 'Submit your application'}
          </Text>
          <Text className="text-white/60 text-sm mt-1">
            Your profile details are pre-filled. Edit if needed.
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-6">
        <Card className="rounded-2xl border-border mb-6 overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-0 px-5 pb-5">
            <View className="mb-4">
              <Text className="text-xs font-bold text-foreground uppercase mb-2">Full Name *</Text>
              <Input
                className="rounded-xl h-12 border-border bg-background px-4 text-foreground"
                placeholder="Enter your full name"
                autoCapitalize="words"
                value={formData.fullName}
                onChangeText={value => handleInputChange('fullName', value)}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-foreground uppercase mb-2">Email Address *</Text>
              <Input
                className="rounded-xl h-12 border-border bg-background px-4 text-foreground"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-foreground uppercase mb-2">Phone Number *</Text>
              <Input
                className="rounded-xl h-12 border-border bg-background px-4 text-foreground"
                placeholder="e.g. 082 123 4567"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={value => handleInputChange('phone', value)}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-foreground uppercase mb-2">Organization</Text>
              <Input
                className="rounded-xl h-12 border-border bg-background px-4 text-foreground"
                placeholder="Company or organisation name"
                autoCapitalize="words"
                value={formData.organization}
                onChangeText={value => handleInputChange('organization', value)}
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-foreground uppercase mb-2">
                Cover letter / Additional information
              </Text>
              <Textarea
                className="rounded-xl min-h-[120px] border-border bg-background px-4 py-3 text-foreground"
                placeholder="Tell us about your project, experience and why you're applying..."
                numberOfLines={5}
                value={formData.description}
                onChangeText={value => handleInputChange('description', value)}
              />
            </View>
          </CardContent>
        </Card>

        <Button
          variant="default"
          size="lg"
          className={cn(
            'mb-3 rounded-xl min-h-12 h-auto py-4 px-5 flex-row items-center justify-center gap-2',
            isSubmitting && 'opacity-80'
          )}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.buttonText} />
          ) : (
            <>
              <Feather name="send" size={20} color={colors.buttonText} />
              <Text className="text-base font-semibold text-primary-foreground">Submit Application</Text>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-xl min-h-12 h-auto py-4 px-5 flex-row items-center justify-center"
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text className="text-base font-medium text-foreground">Cancel</Text>
        </Button>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

export default withAuthGuard(ApplicationFormScreen);
