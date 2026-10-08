import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TextItem, ReaderSettings } from '../types';
import { getTexts, deleteText, getSettings, saveSettings } from '../store/storage';
import { Ionicons } from '@expo/vector-icons';
import SettingsModal from '../components/SettingsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({ wpm: 300, wordsPerChunk: 1, timerMinutes: 0, fontSize: 20 });

  const loadData = async () => {
    const data = await getTexts();
    setTexts(data);
    const globalSettings = await getSettings();
    setSettings(globalSettings);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = async (id: string) => {
    await deleteText(id);
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    setSettingsModalVisible(false);
  };

  const renderItem = ({ item }: { item: TextItem }) => {
    const progress = item.words.length > 0 ? (item.lastReadWordIndex / item.words.length) * 100 : 0;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Reader', { textId: item.id })}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>
            {item.words.length} words • {progress.toFixed(0)}% Read
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Speed Reader</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setSettingsModalVisible(true)} 
            style={styles.iconButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="settings-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddText')} 
            style={styles.iconButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="add-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={texts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No texts yet. Add one to start reading!</Text>
          </View>
        }
      />

      <SettingsModal
        visible={settingsModalVisible}
        initialSettings={settings}
        onClose={() => setSettingsModalVisible(false)}
        onSave={async (newSettings) => {
          setSettings(newSettings);
          await saveSettings(newSettings);
          setSettingsModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 10,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  }
});
