import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface WordItem {
  word: string;
  index: number;
}

interface WordChunk {
  id: string;
  isNewParagraph: boolean;
  words: WordItem[];
}

interface WordPickerModalProps {
  visible: boolean;
  content?: string;
  words: string[];
  currentIndex: number;
  onSelectWord: (index: number) => void;
  onClose: () => void;
}

export const WordPickerModal: React.FC<WordPickerModalProps> = React.memo(({
  visible,
  content,
  words,
  currentIndex,
  onSelectWord,
  onClose,
}) => {
  const flatListRef = useRef<FlatList<WordChunk>>(null);

  // Fecha no botão de voltar físico do Android
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      onClose();
      return true; // intercepta e evita sair do app
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => {
      backHandlerSubscription.remove();
    };
  }, [visible, onClose]);

  // Agrupa as palavras em blocos pequenos (chunks) para renderização ultra-rápida via FlatList
  const chunks = useMemo<WordChunk[]>(() => {
    if (!words || words.length === 0) return [];

    const CHUNK_SIZE = 35;

    // Tentar preservar parágrafos reais caso tenhamos o content original
    if (content) {
      try {
        const lines = content.split('\n');
        const result: WordChunk[] = [];
        let wordCounter = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.length === 0) continue;

          const lineWords = line.split(/\s+/).filter(w => w.length > 0);
          if (lineWords.length === 0) continue;

          for (let start = 0; start < lineWords.length; start += CHUNK_SIZE) {
            const slice = lineWords.slice(start, start + CHUNK_SIZE);
            const chunkWords: WordItem[] = slice.map((w, offset) => ({
              word: w,
              index: wordCounter + offset,
            }));

            result.push({
              id: `chunk-${wordCounter}`,
              isNewParagraph: start === 0,
              words: chunkWords,
            });

            wordCounter += slice.length;
          }
        }

        // Se coincidiu com o total de palavras, usamos a divisão por parágrafos
        if (wordCounter === words.length) {
          return result;
        }
      } catch (e) {
        // Fallback silencioso para divisão uniforme caso ocorra qualquer erro
      }
    }

    // Divisão uniforme por blocos de 35 palavras
    const fallbackResult: WordChunk[] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const slice = words.slice(i, i + CHUNK_SIZE);
      fallbackResult.push({
        id: `chunk-${i}`,
        isNewParagraph: false,
        words: slice.map((w, idx) => ({
          word: w,
          index: i + idx,
        })),
      });
    }

    return fallbackResult;
  }, [words, content]);

  // Rola até o chunk atual ao abrir o modal
  const onScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
    }, 100);
  }, []);

  useEffect(() => {
    if (visible && chunks.length > 0 && currentIndex > 0) {
      const targetChunkIndex = chunks.findIndex(chunk =>
        chunk.words.some(w => w.index === currentIndex)
      );

      if (targetChunkIndex > 0) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: targetChunkIndex,
              animated: false,
              viewPosition: 0.3,
            });
          } catch (e) {
            // Ignora falha inicial
          }
        }, 60);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, chunks, currentIndex]);

  const renderChunk = useCallback(({ item }: { item: WordChunk }) => {
    return (
      <View style={[styles.chunkContainer, item.isNewParagraph && styles.paragraphSpacing]}>
        <Text style={styles.chunkText}>
          {item.words.map((w) => {
            const isSelected = w.index === currentIndex;
            return (
              <Text
                key={w.index}
                onPress={() => onSelectWord(w.index)}
                style={[
                  styles.pickerWord,
                  isSelected && styles.pickerWordActive,
                ]}
              >
                {w.word}{' '}
              </Text>
            );
          })}
        </Text>
      </View>
    );
  }, [currentIndex, onSelectWord]);

  const keyExtractor = useCallback((item: WordChunk) => item.id, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.headerButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.modalTitle}>Select Start Position</Text>
            <Text style={styles.modalSubtitle}>
              Word {Math.min(currentIndex + 1, words.length)} of {words.length}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.headerButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Lista virtualizada de alta performance */}
        {visible && (
          <FlatList
            ref={flatListRef}
            data={chunks}
            renderItem={renderChunk}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.flatListContent}
            initialNumToRender={14}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
});

export default WordPickerModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  headerButton: {
    minWidth: 50,
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  flatListContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  chunkContainer: {
    marginBottom: 2,
  },
  paragraphSpacing: {
    marginTop: 14,
  },
  chunkText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#2C2C2E',
  },
  pickerWord: {
    fontSize: 18,
    color: '#2C2C2E',
  },
  pickerWordActive: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
