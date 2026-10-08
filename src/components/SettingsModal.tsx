import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReaderSettings } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface SettingsModalProps {
  visible: boolean;
  initialSettings: ReaderSettings;
  onSave: (settings: ReaderSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ visible, initialSettings, onSave, onClose }: SettingsModalProps) {
  const [wpmStr, setWpmStr] = useState(initialSettings.wpm.toString());
  const [chunkStr, setChunkStr] = useState(initialSettings.wordsPerChunk.toString());
  const [timerStr, setTimerStr] = useState(initialSettings.timerMinutes.toString());
  const [fontStr, setFontStr] = useState((initialSettings.fontSize || 20).toString());

  useEffect(() => {
    if (visible) {
      setWpmStr(initialSettings.wpm.toString());
      setChunkStr(initialSettings.wordsPerChunk.toString());
      setTimerStr(initialSettings.timerMinutes.toString());
      setFontStr((initialSettings.fontSize || 20).toString());
    }
  }, [visible, initialSettings]);

  const handleSave = () => {
    const wpm = parseInt(wpmStr) || 100;
    const wordsPerChunk = Math.min(5, Math.max(1, parseInt(chunkStr) || 1));
    const timerMinutes = parseInt(timerStr) || 0;
    const fontSize = Math.min(32, Math.max(14, parseInt(fontStr) || 20));

    onSave({ wpm, wordsPerChunk, timerMinutes, fontSize });
  };

  const onRequestClose = () => {
    Alert.alert(
      "Unsaved Changes",
      "Do you want to save your settings before closing?",
      [
        {
          text: "Don't Save",
          style: "destructive",
          onPress: onClose
        },
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Save",
          onPress: handleSave
        }
      ]
    );
  };

  const adjustValue = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, delta: number, min: number, max: number) => {
    const val = parseInt(current) || min;
    const nextVal = Math.min(max, Math.max(min, val + delta));
    setter(nextVal.toString());
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Global Settings</Text>
          <TouchableOpacity onPress={onRequestClose}>
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          
          {/* WPM */}
          <Text style={styles.label}>WPM (Words Per Minute)</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setWpmStr, wpmStr, -10, 50, 1000)}>
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={wpmStr}
              onChangeText={setWpmStr}
            />
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setWpmStr, wpmStr, 10, 50, 1000)}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* CHUNK */}
          <Text style={styles.label}>Words Per Chunk</Text>
          <View style={styles.chunkRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.chunkBtn, parseInt(chunkStr) === num && styles.chunkBtnActive]}
                onPress={() => setChunkStr(num.toString())}
              >
                <Text style={[styles.chunkBtnText, parseInt(chunkStr) === num && styles.chunkBtnTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TIMER */}
          <Text style={styles.label}>Timer Duration (Minutes, 0 = Unlim)</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setTimerStr, timerStr, -1, 0, 120)}>
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={timerStr}
              onChangeText={setTimerStr}
            />
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setTimerStr, timerStr, 1, 0, 120)}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* FONT SIZE */}
          <Text style={styles.label}>Font Size</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setFontStr, fontStr, -1, 14, 32)}>
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={fontStr}
              onChangeText={setFontStr}
            />
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustValue(setFontStr, fontStr, 1, 14, 32)}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Settings</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  adjustBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chunkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  chunkBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chunkBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chunkBtnText: {
    fontSize: 16,
    color: '#333',
  },
  chunkBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
