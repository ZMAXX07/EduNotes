import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function UploadScreen() {
  const { user, uploadDocument, documents } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'application/vnd.ms-powerpoint',
               'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        copyToCacheDirectory: true
      });
      
      if (result.assets && result.assets[0]) {
        setSelectedFile(result);
        setError('');
      }
    } catch (err) {
      setError('Error selecting file');
    }
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile?.assets?.[0]) {
        setError('Please select a file');
        return;
      }

      if (!title || !subject) {
        setError('Please fill in all fields');
        return;
      }

      setIsUploading(true);
      setError('');

      const file = selectedFile.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Create a data URL that can be used to display the file
      const dataUrl = `data:${file.mimeType};base64,${fileContent}`;

      await uploadDocument({
        title,
        subject,
        url: dataUrl,
      });

      setTitle('');
      setSubject('');
      setSelectedFile(null);
      setError('');
    } catch (err) {
      setError('Error uploading document');
    } finally {
      setIsUploading(false);
    }
  };

  if (user?.role === 'guest' || user?.role === 'student') {
    return (
      <View style={styles.container}>
        <View style={styles.guestMessage}>
          <Ionicons name="lock-closed" size={48} color="#666" />
          <Text style={styles.guestTitle}>Access Restricted</Text>
          <Text style={styles.guestText}>
            Only teachers can upload documents
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Document Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />

        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={handleFilePick}
          disabled={isUploading}
        >
          <Ionicons name="cloud-upload" size={48} color="#1a73e8" />
          <Text style={styles.uploadText}>
            {selectedFile?.assets?.[0] ? 
              selectedFile.assets[0].name : 
              'Tap to Select Document'
            }
          </Text>
          <Text style={styles.supportedFormats}>
            Supported formats: PDF, DOC, DOCX, PPT, PPTX
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            (!selectedFile || isUploading) && styles.buttonDisabled
          ]} 
          onPress={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Text>
        </TouchableOpacity>

        <View style={styles.recentUploads}>
          <Text style={styles.sectionTitle}>Recent Uploads</Text>
          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent uploads</Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <Ionicons name="document" size={24} color="#1a73e8" />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentSubject}>{doc.subject}</Text>
                </View>
                <Text style={styles.documentDate}>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  uploadArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a73e8',
    marginTop: 16,
    textAlign: 'center',
  },
  supportedFormats: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  recentUploads: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
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
  documentSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#666',
  },
  guestMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  guestText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});