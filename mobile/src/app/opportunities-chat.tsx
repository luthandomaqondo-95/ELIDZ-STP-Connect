import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { storage } from '@/utils/storage';
import { withAuthGuard } from '@/components/withAuthGuard';

function OpportunitiesChatScreen() {
  const { colors } = useTheme();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    const opps = await storage.getOpportunities();
    setOpportunities(opps.slice(0, 5));
  };

  const handleShareOpportunity = async () => {
    if (!selectedOpp) {
      Alert.alert('Error', 'Please select an opportunity to share');
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    try {
      const sharedItem = {
        id: Date.now().toString(),
        opportunityId: selectedOpp.id,
        opportunityTitle: selectedOpp.title,
        message: shareMessage,
        sharedWith: selectedContacts,
        timestamp: new Date().toISOString(),
      };

      const saved = await storage.getSharedOpportunities();
      await storage.setSharedOpportunities([...saved, sharedItem]);

      Alert.alert('Success', `Opportunity shared with ${selectedContacts.length} contact(s)!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to share opportunity');
    }
  };

  const mockContacts = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' },
    { id: '4', name: 'Emily Chen' },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={[styles.section, { backgroundColor: colors.backgroundDefault, ...Shadow.card, borderRadius: BorderRadius.card, padding: Spacing.lg, marginBottom: Spacing.lg }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>
          Select Opportunity to Share
        </Text>
        <FlatList
          data={opportunities}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.opportunityItem,
                {
                  backgroundColor: selectedOpp?.id === item.id ? colors.primary : colors.backgroundRoot,
                  borderColor: selectedOpp?.id === item.id ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => setSelectedOpp(item)}
            >
              <Feather
                name={selectedOpp?.id === item.id ? 'check-circle' : 'circle'}
                size={20}
                color={selectedOpp?.id === item.id ? '#FFFFFF' : colors.textSecondary}
              />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[Typography.body, { color: selectedOpp?.id === item.id ? '#FFFFFF' : colors.text, fontWeight: '500' }]}>
                  {item.title}
                </Text>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.backgroundDefault, ...Shadow.card, borderRadius: BorderRadius.card, padding: Spacing.lg, marginBottom: Spacing.lg }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>
          Select Contacts to Share With
        </Text>
        <FlatList
          data={mockContacts}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.contactItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                if (selectedContacts.includes(item.id)) {
                  setSelectedContacts(selectedContacts.filter(id => id !== item.id));
                } else {
                  setSelectedContacts([...selectedContacts, item.id]);
                }
              }}
            >
              <Feather
                name={selectedContacts.includes(item.id) ? 'check-square' : 'square'}
                size={20}
                color={selectedContacts.includes(item.id) ? colors.primary : colors.textSecondary}
              />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>
                {item.name}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.backgroundDefault, ...Shadow.card, borderRadius: BorderRadius.card, padding: Spacing.lg, marginBottom: Spacing.lg }]}>
        <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>
          Add Personal Message
        </Text>
        <TextInput
          style={[
            styles.messageInput,
            {
              backgroundColor: colors.backgroundRoot,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Add a personal message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={shareMessage}
          onChangeText={setShareMessage}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.shareButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handleShareOpportunity}
      >
        <Feather name="send" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
        <Text style={[Typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
          Share Opportunity
        </Text>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  opportunityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.xl,
  },
});

export default withAuthGuard(OpportunitiesChatScreen);
