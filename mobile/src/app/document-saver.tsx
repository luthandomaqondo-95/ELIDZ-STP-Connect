import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { storage } from '@/utils/storage';
import { withAuthGuard } from '@/components/withAuthGuard';

function DocumentSaverScreen() {
  const { colors } = useTheme();
  const [documents, setDocuments] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const saved = await storage.getOfflineDocuments();
    setDocuments(saved);
  };

  const handleSaveDocument = async () => {
    if (!docName.trim() || !docContent.trim()) {
      Alert.alert('Error', 'Please enter document name and content');
      return;
    }

    try {
      const newDoc = {
        id: Date.now().toString(),
        name: docName,
        content: docContent,
        savedAt: new Date().toISOString(),
        size: `${(docContent.length / 1024).toFixed(2)} KB`,
      };

      const updated = [...documents, newDoc];
      await storage.setOfflineDocuments(updated);
      setDocuments(updated);

      setDocName('');
      setDocContent('');
      setShowAddForm(false);

      Alert.alert('Success', 'Document saved offline successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = documents.filter(doc => doc.id !== id);
          await storage.setOfflineDocuments(updated);
          setDocuments(updated);
        },
      },
    ]);
  };

  const renderDocument = ({ item }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.docCard,
        {
          backgroundColor: colors.backgroundDefault,
          opacity: pressed ? 0.7 : 1,
          ...Shadow.card,
        },
      ]}
    >
      <View style={styles.docHeader}>
        <View style={[styles.docIcon, { backgroundColor: colors.primary }]}>
          <Feather name="file-text" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.docInfo}>
          <Text style={[Typography.body, { fontWeight: '600' }]}>
            {item.name}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            {item.size} • Saved {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDeleteDocument(item.id)}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Feather name="trash-2" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Text
        style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}
        numberOfLines={3}
      >
        {item.content}
      </Text>
    </Pressable>
  );

  return (
    <ScreenScrollView>
      {!showAddForm ? (
        <>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => setShowAddForm(true)}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
              New Document
            </Text>
          </Pressable>

          <Text style={[Typography.h3, { marginTop: Spacing.xl, marginBottom: Spacing.lg }]}>
            Saved Documents ({documents.length})
          </Text>

          {documents.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
              <Feather name="inbox" size={48} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                No documents saved yet
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Save documents for offline access
              </Text>
            </View>
          ) : (
            <FlatList
              data={documents}
              renderItem={renderDocument}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            />
          )}
        </>
      ) : (
        <View style={[styles.formContainer, { backgroundColor: colors.backgroundDefault, ...Shadow.card, borderRadius: BorderRadius.card, padding: Spacing.lg }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>
            Save Document Offline
          </Text>

          <View style={styles.formGroup}>
            <Text style={[Typography.caption, { fontWeight: '600', marginBottom: Spacing.sm }]}>
              Document Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundRoot,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter document name"
              placeholderTextColor={colors.textSecondary}
              value={docName}
              onChangeText={setDocName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[Typography.caption, { fontWeight: '600', marginBottom: Spacing.sm }]}>
              Document Content
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.backgroundRoot,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter or paste your document content here"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={8}
              value={docContent}
              onChangeText={setDocContent}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleSaveDocument}
          >
            <Feather name="save" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <Text style={[Typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
              Save Document
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => {
              setShowAddForm(false);
              setDocName('');
              setDocContent('');
            }}
          >
            <Text style={[Typography.body, { color: colors.text }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.lg,
  },
  docCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    fontFamily: 'System',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.md,
  },
  cancelButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default withAuthGuard(DocumentSaverScreen);
