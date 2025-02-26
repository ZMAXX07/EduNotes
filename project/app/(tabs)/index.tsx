import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export default function BrowseScreen() {
  const { user, documents } = useAuth();

  const openDocument = async (url: string) => {
    if (Platform.OS === 'web') {
      // For web, open in a new tab
      window.open(url, '_blank');
    } else {
      // For mobile, use WebBrowser
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.subject]) {
      acc[doc.subject] = [];
    }
    acc[doc.subject].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.username}!</Text>
        <Text style={styles.subtitle}>Browse Documents</Text>
      </View>

      {Object.keys(groupedDocuments).length === 0 ? (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No documents available</Text>
          </View>
        </View>
      ) : (
        Object.entries(groupedDocuments).map(([subject, docs]) => (
          <View key={subject} style={styles.section}>
            <Text style={styles.sectionTitle}>{subject}</Text>
            {docs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentItem}
                onPress={() => openDocument(doc.url)}
              >
                <Ionicons name="document" size={24} color="#1a73e8" />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentMeta}>
                    Uploaded by {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  documentMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});