# Specification: RSVP Speed Reader Mini-App (Android)

## 1. Executive Summary
Build a mobile-first RSVP (Rapid Serial Visual Presentation) Speed Reader application tailored for Android using React Native (Expo) and TypeScript. The app enables users to practice speed reading, chunking, and peripheral vision development through a custom text runner with precision layout controls, local text management, and persistent progress tracking.

---

## 2. Target Technology Stack
- **Framework:** React Native with Expo (Managed Workflow)
- **Language:** TypeScript
- **State Management & Storage:** `@react-native-async-storage/async-storage`
- **UI Components:** React Native core components (`View`, `Text`, `TouchableOpacity`, `FlatList`, `Modal`, `Slider`)
- **Icons:** `@expo/vector-icons`

---

## 3. Core Features & Specifications

### A. Text Library Management
1. **Multiple Text Storage:**
   - Add, list, view, and delete custom texts.
   - Each text entry contains: `id`, `title`, `content`, `lastReadWordIndex`, `createdAt`, `updatedAt`.
2. **Text Selection:**
   - Select any stored text to open in the RSVP Reader screen.
   - Display reading progress percentage on the list view.

### B. Custom RSVP Engine & Display Specs
1. **Word Chunking:**
   - Configurable words per flash (`wordsPerChunk`: 1 to 5 words).
2. **Speed Control:**
   - Adjustable Words Per Minute (`WPM`: 100 to 1000 WPM, in steps of 5 or 10).
3. **Visual Alignment & Central Focus Marking:**
   - **Central Guide Line / Target Indicator:** Vertical center alignment guide in the reading frame.
   - **Contrast Styling Rules:**
     - **Center Word:** Colored in **Pure White (`#FFFFFF`)**.
     - **Border/Peripheral Words:** Colored in **Muted Gray (`#888888`)**.
     - *Example (3 words: "o cérebro humano"):*
       - "o" -> Gray (`#888888`)
       - "cérebro" -> White (`#FFFFFF`) [Center Focus]
       - "humano" -> Gray (`#888888`)
   - **Background:** Dark theme (`#121212` or `#000000`) for high contrast and reduced eye strain.

### C. Reading Session & Timer
1. **Timed Sessions:**
   - Configurable session timer (e.g., 1 min, 3 min, 5 min, 10 min, or unlimited).
   - Auto-pause when timer reaches 0:00 with completion sound/vibration feedback.
2. **Interactive Word Selector (Start Position):**
   - Ability to tap "Select Starting Position" to open a full-text modal view.
   - Tap any word/paragraph in the full text to set the exact `currentWordIndex` where the next session starts.

### D. Persistence & Settings Auto-Save
1. **Global App Settings (AsyncStorage):**
   - Default `WPM`.
   - Default `wordsPerChunk`.
   - Default `timerDurationMinutes`.
2. **Reading Progress Persistence:**
   - Automatically save the exact `lastReadWordIndex` per text whenever paused, stopped, or when the timer ends.
   - Resume seamlessly from the saved position when reopening a text.

---

## 4. Screen Flow & Architecture

### Screen 1: Home / Library Screen (`HomeScreen.tsx`)
- Header with "Add New Text" button (+).
- List of saved texts showing Title, Word Count, Last Read Progress (%), and Delete action.
- Settings button to open global configuration modal.

### Screen 2: Text Editor / Add Screen (`AddTextScreen.tsx`)
- Inputs for `Title` and `Content` (large multiline text area).
- "Save Text" button.

### Screen 3: RSVP Reader Screen (`ReaderScreen.tsx`)
- **Top Bar:** Back button, Timer countdown readout, Settings shortcut.
- **Main Display Area (Center Box):**
  - High-contrast dark container.
  - Top and bottom visual notch/marker indicating exact center line.
  - Chunked text rendered with central white word and peripheral gray words.
- **Controls Panel (Bottom):**
  - Big Play/Pause Toggle button.
  - WPM Slider/Counter (`-` / `+` quick adjust).
  - Words Per Chunk Selector (`1`, `2`, `3`, `4`, `5`).
  - "Choose Start Word" button (opens Full Text Picker Modal).
- **Full Text Picker Modal:**
  - Scrollable view of full text with words wrapped in touchable components to manually select the starting index.

---

## 5. Technical Requirements & Performance Rules
1. **Precise Interval Calculation:**
   - Calculate delay per chunk using: `intervalMs = (60 / WPM) * wordsPerChunk * 1000`.
   - Use `useRef` or custom precise timer hook (`requestAnimationFrame` / `setInterval` optimization) to avoid React re-render lag during high WPM runs.
2. **Data Structure Example:**
   ```typescript
   interface TextItem {
     id: string;
     title: string;
     content: string;
     words: string[];
     lastReadWordIndex: number;
     createdAt: number;
   }

   interface ReaderSettings {
     wpm: number;
     wordsPerChunk: number;
     timerMinutes: number;
   }