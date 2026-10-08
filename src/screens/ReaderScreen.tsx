import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TextItem, ReaderSettings } from '../types';
import { getTexts, updateTextProgress, getSettings, saveSettings } from '../store/storage';
import SettingsModal from '../components/SettingsModal';
import WordPickerModal from '../components/WordPickerModal';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;

export default function ReaderScreen() {
  const route = useRoute<ReaderRouteProp>();
  const navigation = useNavigation();
  const { textId } = route.params;

  const [text, setText] = useState<TextItem | null>(null);
  const [settings, setSettings] = useState<ReaderSettings | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [wordsPerChunk, setWordsPerChunk] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const playIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Load data
  useEffect(() => {
    const init = async () => {
      const texts = await getTexts();
      const currentText = texts.find(t => t.id === textId);
      if (currentText) {
        setText(currentText);
        setCurrentIndex(currentText.lastReadWordIndex || 0);
      } else {
        Alert.alert('Error', 'Text not found');
        navigation.goBack();
      }

      const defaultSettings = await getSettings();
      setSettings(defaultSettings);
      setWpm(defaultSettings.wpm);
      setWordsPerChunk(defaultSettings.wordsPerChunk);
      setTimeRemaining(defaultSettings.timerMinutes * 60);
    };
    init();
  }, [textId]);

  // Save progress on unmount or pause
  const saveProgress = useCallback(() => {
    if (text) {
      updateTextProgress(text.id, currentIndex);
    }
  }, [text, currentIndex]);

  useEffect(() => {
    return () => {
      saveProgress();
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [saveProgress]);

  // Handle Play/Pause logic
  useEffect(() => {
    if (isPlaying && text) {
      const intervalMs = (60 / wpm) * wordsPerChunk * 1000;
      
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          let dynamicChunkSize = 1;
          let charCount = text.words[prev].length;
          for (let i = 1; i < wordsPerChunk; i++) {
            if (prev + i >= text.words.length) break;
            const nextWordLen = text.words[prev + i].length;
            if (charCount + 1 + nextWordLen > 18) break;
            charCount += 1 + nextWordLen;
            dynamicChunkSize++;
          }
          const nextIndex = prev + dynamicChunkSize;
          if (nextIndex >= text.words.length) {
            setIsPlaying(false);
            return text.words.length - 1; // Stop at the end
          }
          return nextIndex;
        });
      }, intervalMs);

      // Session Timer logic
      if (settings?.timerMinutes && settings.timerMinutes > 0 && timeRemaining > 0) {
        timerIntervalRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setIsPlaying(false);
              Alert.alert('Time is up!', 'Your reading session has finished.');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      saveProgress();
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, wpm, wordsPerChunk, text, settings, saveProgress]);

  if (!text || !settings) return <SafeAreaView style={styles.container}><Text style={{color: 'white'}}>Loading...</Text></SafeAreaView>;

  // Prepare chunks for display
  let dynamicChunkSize = 1;
  let charCount = text.words[currentIndex].length;
  for (let i = 1; i < wordsPerChunk; i++) {
    if (currentIndex + i >= text.words.length) break;
    const nextWordLen = text.words[currentIndex + i].length;
    if (charCount + 1 + nextWordLen > 18) break;
    charCount += 1 + nextWordLen;
    dynamicChunkSize++;
  }
  const endIndex = Math.min(currentIndex + dynamicChunkSize, text.words.length);
  const currentWords = text.words.slice(currentIndex, endIndex);
  
  const renderRSVPText = () => {
    const fullText = currentWords.join(' ');
    let orpIndex = Math.floor(fullText.length / 2);
    
    if (fullText[orpIndex] === ' ' && orpIndex < fullText.length - 1) {
      orpIndex++;
    }

    let leftElements: React.ReactNode[] = [];
    let rightElements: React.ReactNode[] = [];
    let orpChar = '';

    let currentIndexInString = 0;

    currentWords.forEach((word, i) => {
      const wordStart = currentIndexInString;
      const wordEnd = currentIndexInString + word.length;
      const isLastWord = i === currentWords.length - 1;
      
      if (orpIndex >= wordStart && orpIndex < wordEnd) {
        const charIdx = orpIndex - wordStart;
        const prefix = word.substring(0, charIdx);
        orpChar = word.substring(charIdx, charIdx + 1);
        const suffix = word.substring(charIdx + 1);

        if (prefix.length > 0) {
          leftElements.push(<Text key={`left-part-${i}`} style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{prefix}</Text>);
        }
        
        if (suffix.length > 0 || !isLastWord) {
          const space = isLastWord ? '' : ' ';
          rightElements.push(<Text key={`right-part-${i}`} style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{suffix}{space}</Text>);
        }
      } else if (wordEnd <= orpIndex) {
        const space = isLastWord ? '' : ' ';
        leftElements.push(<Text key={`left-word-${i}`} style={{ color: '#888888', fontWeight: '500' }}>{word}{space}</Text>);
      } else {
        const space = isLastWord ? '' : ' ';
        rightElements.push(<Text key={`right-word-${i}`} style={{ color: '#888888', fontWeight: '500' }}>{word}{space}</Text>);
      }

      currentIndexInString += word.length + 1;
    });

    const fontSize = settings.fontSize || 20;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ fontSize, textAlign: 'right' }} numberOfLines={1}>
            {leftElements}
          </Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#FF3B30', fontSize, fontWeight: 'bold' }}>{orpChar}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{ fontSize, textAlign: 'left' }} numberOfLines={1}>
            {rightElements}
          </Text>
        </View>
      </View>
    );
  };

  const formatTime = (secs: number) => {
    if (settings.timerMinutes === 0) return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => { saveProgress(); navigation.goBack(); }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        <TouchableOpacity 
          onPress={() => { setIsPlaying(false); setSettingsModalVisible(true); }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* RSVP DISPLAY AREA */}
      <View style={styles.displayArea}>
        <View style={styles.notchTop} />
        <View style={styles.textWrapper}>
          {renderRSVPText()}
        </View>
        <View style={styles.notchBottom} />
      </View>

      {/* PROGRESS */}
      <Text style={styles.progressText}>
        {Math.round(((currentIndex + 1) / text.words.length) * 100)}% ({currentIndex + 1} / {text.words.length})
      </Text>

      {/* CONTROLS */}
      <View style={styles.controlsContainer}>
        
        {/* Play / Pause */}
        <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#000" />
        </TouchableOpacity>

        <View style={styles.settingsRow}>
          {/* WPM Control */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>WPM</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setWpm(w => Math.max(100, w - 10))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{wpm}</Text>
              <TouchableOpacity onPress={() => setWpm(w => Math.min(1000, w + 10))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chunk Control */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Chunk</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setWordsPerChunk(c => Math.max(1, c - 1))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{wordsPerChunk}</Text>
              <TouchableOpacity onPress={() => setWordsPerChunk(c => Math.min(5, c + 1))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Full Text Picker Button */}
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => { setIsPlaying(false); setPickerModalVisible(true); }}
        >
          <Text style={styles.pickerButtonText}>Choose Start Word</Text>
        </TouchableOpacity>

      </View>

      {/* FULL TEXT PICKER MODAL */}
      <WordPickerModal
        visible={pickerModalVisible}
        content={text.content}
        words={text.words}
        currentIndex={currentIndex}
        onSelectWord={(index) => {
          setCurrentIndex(index);
          setPickerModalVisible(false);
        }}
        onClose={() => setPickerModalVisible(false)}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        visible={settingsModalVisible}
        initialSettings={settings}
        onClose={() => setSettingsModalVisible(false)}
        onSave={async (newSettings) => {
          setSettings(newSettings);
          setWpm(newSettings.wpm);
          setWordsPerChunk(newSettings.wordsPerChunk);
          if (newSettings.timerMinutes !== settings.timerMinutes) {
            setTimeRemaining(newSettings.timerMinutes * 60);
          }
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
    backgroundColor: '#121212',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 15,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  displayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  notchTop: {
    position: 'absolute',
    top: '30%',
    width: 2,
    height: 15,
    backgroundColor: '#FF3B30',
  },
  notchBottom: {
    position: 'absolute',
    bottom: '30%',
    width: 2,
    height: 15,
    backgroundColor: '#FF3B30',
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerWord: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  peripheralWord: {
    fontWeight: '500',
    color: '#888888',
    textAlign: 'center',
  },
  progressText: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  controlsContainer: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: -40,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  settingsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  stepBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controlValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
  },
  pickerButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  pickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
