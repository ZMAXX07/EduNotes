import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  username: string;
  role: 'teacher' | 'student' | 'guest';
};

type Document = {
  id: string;
  title: string;
  url: string;
  subject: string;
  uploadedBy: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  documents: Document[];
  signIn: (username: string, pin: string, role: 'teacher' | 'student') => Promise<boolean>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  uploadDocument: (document: Omit<Document, 'id' | 'createdAt' | 'uploadedBy'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadUser();
    loadDocuments();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docsData = await AsyncStorage.getItem('documents');
      if (docsData) {
        setDocuments(JSON.parse(docsData));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const signIn = async (username: string, pin: string, role: 'teacher' | 'student'): Promise<boolean> => {
    if (username && pin) {
      const user = {
        id: Math.random().toString(),
        username,
        role,
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return true;
    }
    return false;
  };

  const signInAsGuest = async () => {
    const guestUser = {
      id: 'guest',
      username: 'Guest',
      role: 'guest' as const,
    };
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const uploadDocument = async (doc: Omit<Document, 'id' | 'createdAt' | 'uploadedBy'>) => {
    if (user?.role !== 'teacher') {
      throw new Error('Only teachers can upload documents');
    }

    const newDoc: Document = {
      ...doc,
      id: Math.random().toString(),
      uploadedBy: user.username,
      createdAt: new Date().toISOString(),
    };

    const updatedDocs = [...documents, newDoc];
    await AsyncStorage.setItem('documents', JSON.stringify(updatedDocs));
    setDocuments(updatedDocs);
  };

  const deleteDocument = async (id: string) => {
    if (user?.role !== 'teacher') {
      throw new Error('Only teachers can delete documents');
    }

    const updatedDocs = documents.filter(doc => doc.id !== id);
    await AsyncStorage.setItem('documents', JSON.stringify(updatedDocs));
    setDocuments(updatedDocs);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      documents, 
      signIn, 
      signOut, 
      signInAsGuest, 
      uploadDocument,
      deleteDocument 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}