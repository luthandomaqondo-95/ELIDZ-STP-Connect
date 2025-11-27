import React, { useState, useEffect } from 'react';
import { View, Alert, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { useAuthContext } from '@/hooks/use-auth-context';
import { withAuthGuard } from '@/components/withAuthGuard';
import { progressReportService, ProgressReport } from '@/services/progress-report.service';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';

interface AcceptedApplication {
  id: string;
  opportunity_id: string;
  opportunity: {
    id: string;
    title: string;
    type: string;
  };
  submitted_at: string;
}

function ProgressReportsScreen() {
  const { profile } = useAuthContext();
  const [acceptedApplications, setAcceptedApplications] = useState<AcceptedApplication[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AcceptedApplication | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportPeriodStart, setReportPeriodStart] = useState(new Date());
  const [reportPeriodEnd, setReportPeriodEnd] = useState(new Date());
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const [applications, reports] = await Promise.all([
        progressReportService.getAcceptedFundingApplications(profile.id),
        progressReportService.getSMMEProgressReports(profile.id),
      ]);
      
      setAcceptedApplications(applications);
      setProgressReports(reports);
    } catch (error: any) {
      console.error('Error loading progress reports data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocumentUri(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedApplication) {
      Alert.alert('Error', 'Please select a funding opportunity');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the progress report');
      return;
    }

    if (reportPeriodStart >= reportPeriodEnd) {
      Alert.alert('Validation Error', 'End date must be after start date');
      return;
    }

    if (!documentUri) {
      Alert.alert('Validation Error', 'Please upload a progress report document');
      return;
    }

    setIsSubmitting(true);

    try {
      await progressReportService.createProgressReport({
        application_id: selectedApplication.id,
        opportunity_id: selectedApplication.opportunity_id,
        title: title.trim(),
        description: description.trim() || undefined,
        report_period_start: reportPeriodStart.toISOString().split('T')[0],
        report_period_end: reportPeriodEnd.toISOString().split('T')[0],
        documentUri: documentUri,
      });

      Alert.alert('Success', 'Progress report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowAddForm(false);
            setSelectedApplication(null);
            setTitle('');
            setDescription('');
            setDocumentUri(null);
            loadData();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting progress report:', error);
      Alert.alert('Error', error.message || 'Failed to submit progress report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#28A745';
      case 'reviewed':
        return '#17A2B8';
      case 'revision_requested':
        return '#FFA500';
      case 'submitted':
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'reviewed':
        return 'Under Review';
      case 'revision_requested':
        return 'Revision Required';
      case 'submitted':
      default:
        return 'Submitted';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#002147" />
        <Text className="text-muted-foreground mt-4">Loading...</Text>
      </View>
    );
  }

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
          <Text className="text-white text-xl font-bold">Progress Reports</Text>
          <HeaderAvatar />
        </View>
      </LinearGradient>

      <ScreenScrollView>
        <View className="px-6 py-6">
          {/* Info Banner */}
          {acceptedApplications.length === 0 ? (
            <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
              <View className="flex-row items-start">
                <Feather name="info" size={20} color="#002147" style={{ marginRight: 12, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-foreground text-base font-semibold mb-1">No Funding Received</Text>
                  <Text className="text-muted-foreground text-sm leading-5">
                    You need to have an accepted funding application before you can submit progress reports. 
                    Apply for funding opportunities and wait for approval.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Add Report Button */}
              {!showAddForm && (
                <Pressable
                  onPress={() => setShowAddForm(true)}
                  className="bg-accent py-4 rounded-xl mb-6 flex-row items-center justify-center active:opacity-90"
                >
                  <Feather name="plus" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-base font-bold">Submit Progress Report</Text>
                </Pressable>
              )}

              {/* Add Report Form */}
              {showAddForm && (
                <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-foreground text-lg font-bold">New Progress Report</Text>
                    <Pressable onPress={() => {
                      setShowAddForm(false);
                      setSelectedApplication(null);
                      setTitle('');
                      setDescription('');
                      setDocumentUri(null);
                    }}>
                      <Feather name="x" size={20} color="#6C757D" />
                    </Pressable>
                  </View>

                  {/* Select Funding Opportunity */}
                  <View className="mb-4">
                    <Text className="text-foreground text-sm font-semibold mb-2">Funding Opportunity *</Text>
                    <View className="bg-input border border-border rounded-xl overflow-hidden">
                      <Picker
                        selectedValue={selectedApplication?.id}
                        onValueChange={(value) => {
                          const app = acceptedApplications.find(a => a.id === value);
                          setSelectedApplication(app || null);
                        }}
                        style={{ color: '#002147' }}
                        dropdownIconColor="#FF6600"
                      >
                        <Picker.Item label="Select funding opportunity..." value="" color="#9CA3AF" />
                        {acceptedApplications.map((app) => (
                          <Picker.Item 
                            key={app.id} 
                            label={app.opportunity.title} 
                            value={app.id} 
                            color="#FF6600" 
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Title */}
                  <View className="mb-4">
                    <Text className="text-foreground text-sm font-semibold mb-2">Report Title *</Text>
                    <TextInput
                      className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                      placeholder="e.g., Q1 2025 Progress Report"
                      placeholderTextColor="#9CA3AF"
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  {/* Description */}
                  <View className="mb-4">
                    <Text className="text-foreground text-sm font-semibold mb-2">Description</Text>
                    <TextInput
                      className="bg-input border border-border rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                      placeholder="Brief summary of progress..."
                      placeholderTextColor="#9CA3AF"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Report Period */}
                  <View className="mb-4">
                    <Text className="text-foreground text-sm font-semibold mb-2">Report Period *</Text>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-muted-foreground text-xs mb-1">Start Date (YYYY-MM-DD)</Text>
                        <TextInput
                          className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                          placeholder="2025-01-01"
                          placeholderTextColor="#9CA3AF"
                          value={reportPeriodStart.toISOString().split('T')[0]}
                          onChangeText={(text) => {
                            const date = new Date(text);
                            if (!isNaN(date.getTime())) {
                              setReportPeriodStart(date);
                            }
                          }}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-muted-foreground text-xs mb-1">End Date (YYYY-MM-DD)</Text>
                        <TextInput
                          className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                          placeholder="2025-03-31"
                          placeholderTextColor="#9CA3AF"
                          value={reportPeriodEnd.toISOString().split('T')[0]}
                          onChangeText={(text) => {
                            const date = new Date(text);
                            if (!isNaN(date.getTime())) {
                              setReportPeriodEnd(date);
                            }
                          }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Document Upload */}
                  <View className="mb-4">
                    <Text className="text-foreground text-sm font-semibold mb-2">Progress Report Document *</Text>
                    <Pressable
                      onPress={handlePickDocument}
                      className={`border-2 border-dashed rounded-xl p-4 items-center ${
                        documentUri ? 'border-constructive bg-constructive/10' : 'border-border bg-muted/30'
                      }`}
                    >
                      {documentUri ? (
                        <>
                          <Feather name="check-circle" size={32} color="#28A745" />
                          <Text className="text-constructive text-sm font-semibold mt-2">Document Selected</Text>
                          <Text className="text-muted-foreground text-xs mt-1">Tap to change</Text>
                        </>
                      ) : (
                        <>
                          <Feather name="upload" size={32} color="#6C757D" />
                          <Text className="text-foreground text-sm font-semibold mt-2">Upload Document</Text>
                          <Text className="text-muted-foreground text-xs mt-1">PDF, DOC, or DOCX</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSubmitReport}
                    disabled={isSubmitting || !selectedApplication || !title.trim() || !documentUri}
                    className={`py-4 rounded-xl flex-row items-center justify-center ${
                      isSubmitting || !selectedApplication || !title.trim() || !documentUri
                        ? 'bg-muted opacity-50'
                        : 'bg-primary active:opacity-90'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white text-base font-bold">Submitting...</Text>
                      </>
                    ) : (
                      <>
                        <Feather name="send" size={18} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white text-base font-bold">Submit Report</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Progress Reports List */}
              <View className="mb-6">
                <Text className="text-foreground text-lg font-bold mb-4">Submitted Reports</Text>
                {progressReports.length === 0 ? (
                  <View className="bg-card rounded-2xl p-6 border border-border border-dashed items-center">
                    <Feather name="file-text" size={48} color="#CBD5E0" />
                    <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                      No progress reports submitted yet
                    </Text>
                    <Text className="text-muted-foreground text-sm mt-2 text-center">
                      Submit your first progress report using the button above
                    </Text>
                  </View>
                ) : (
                  progressReports.map((report) => (
                    <Pressable
                      key={report.id}
                      className="bg-card rounded-2xl p-5 mb-3 border border-border active:opacity-95"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-foreground text-base font-bold mb-1">{report.title}</Text>
                          <Text className="text-muted-foreground text-sm">
                            {report.opportunity?.title || 'Funding Opportunity'}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${getStatusColor(report.status)}20` }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: getStatusColor(report.status) }}
                          >
                            {getStatusText(report.status)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center mb-2">
                        <Feather name="calendar" size={14} color="#6C757D" style={{ marginRight: 6 }} />
                        <Text className="text-muted-foreground text-xs">
                          {new Date(report.report_period_start).toLocaleDateString()} - {new Date(report.report_period_end).toLocaleDateString()}
                        </Text>
                      </View>

                      {report.description && (
                        <Text className="text-muted-foreground text-sm mb-3" numberOfLines={2}>
                          {report.description}
                        </Text>
                      )}

                      {report.admin_feedback && (
                        <View className="bg-primary/10 border border-primary/20 rounded-xl p-3 mt-3">
                          <Text className="text-primary text-xs font-semibold mb-1">Admin Feedback:</Text>
                          <Text className="text-foreground text-xs">{report.admin_feedback}</Text>
                        </View>
                      )}

                      {report.document_url && (
                        <Pressable
                          onPress={() => {
                            if (report.document_url) {
                              // Open document URL
                              // You might want to use Linking.openURL or a document viewer
                              Alert.alert('Document', 'Document URL: ' + report.document_url);
                            }
                          }}
                          className="flex-row items-center mt-3 pt-3 border-t border-border"
                        >
                          <Feather name="file" size={16} color="#002147" style={{ marginRight: 8 }} />
                          <Text className="text-primary text-sm font-semibold">View Document</Text>
                        </Pressable>
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScreenScrollView>
    </View>
  );
}

export default withAuthGuard(ProgressReportsScreen);

