import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Animated, ScrollView
} from 'react-native';
import { Audio } from 'expo-av';

const BACKEND_URL = 'https://hackhazards-voice-app.onrender.com';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerAudio, setAnswerAudio] = useState('');
  const [error, setError] = useState('');
  const [sound, setSound] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestPermissions();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (screen === 'listening') {
      startPulse();
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'result' && answerAudio) {
      playAudio(answerAudio);
    }
  }, [screen, answerAudio]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required to use this app.');
      }
    } catch (e) {
      console.log('Permission error:', e);
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (e) {
      console.log('Start recording error:', e);
      setError('Could not start recording. Please try again.');
    }
  };

  const stopRecordingAndProcess = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setScreen('listening');
      await sendToBackend(uri);
    } catch (e) {
      console.log('Stop recording error:', e);
      setError('Recording failed. Please try again.');
      setScreen('home');
    }
  };

  const sendToBackend = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      const response = await fetch(`${BACKEND_URL}/process-voice`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnswerText(data.answerText);
      setAnswerAudio(data.answerAudio);
      setScreen('result');
    } catch (e) {
      console.log('Backend error:', e);
      setError('Could not get answer. Make sure server is running and try again.');
      setScreen('result');
      setAnswerText('कुछ गलत हो गया। कृपया दोबारा कोशिश करें।');
    }
  };

  const playAudio = async (base64Audio) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const audioUri = `data:audio/wav;base64,${base64Audio}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (e) {
      console.log('Playback error:', e);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecordingAndProcess();
    } else {
      startRecording();
    }
  };

  const goHome = () => {
    if (sound) {
      sound.stopAsync();
      sound.unloadAsync();
      setSound(null);
    }
    setAnswerText('');
    setAnswerAudio('');
    setError('');
    setScreen('home');
  };

  // ── HOME SCREEN ──────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>हिंदी वॉइस असिस्टेंट</Text>
        <Text style={styles.subtitle}>
          {isRecording ? '🔴 रिकॉर्डिंग हो रही है...' : 'बोलिए, हम सुन रहे हैं'}
        </Text>

        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={handleMicPress}
          activeOpacity={0.8}
        >
          <Text style={styles.micEmoji}>🎤</Text>
        </TouchableOpacity>

        <Text style={styles.tapHint}>
          {isRecording ? 'रोकने के लिए दोबारा दबाएं' : 'बात करने के लिए दबाएं'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // ── LISTENING SCREEN ─────────────────────────────────────────
  if (screen === 'listening') {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.listeningText}>आपकी आवाज़ सुन रहे हैं...</Text>
        <ActivityIndicator size="large" color="#5B4FCF" style={{ marginTop: 24 }} />
        <Text style={styles.processingText}>जवाब तैयार हो रहा है</Text>
      </View>
    );
  }

  // ── RESULT SCREEN ────────────────────────────────────────────
  if (screen === 'result') {
    return (
      <View style={styles.container}>
        <Text style={styles.resultLabel}>जवाब:</Text>
        <ScrollView
          style={styles.answerScroll}
          contentContainerStyle={styles.answerScrollContent}
        >
          <Text style={styles.answerText}>{answerText}</Text>
        </ScrollView>

        {answerAudio ? (
          <TouchableOpacity
            style={styles.listenButton}
            onPress={() => playAudio(answerAudio)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🔊  सुनिए</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.backButton}
          onPress={goHome}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🎤  वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 22,
    color: '#C4B5FD',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0C0',
    marginBottom: 48,
    textAlign: 'center',
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#5B4FCF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  micButtonActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  micEmoji: {
    fontSize: 64,
  },
  tapHint: {
    fontSize: 14,
    color: '#6060A0',
    marginTop: 24,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5B4FCF',
    opacity: 0.6,
    marginBottom: 32,
  },
  listeningText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingText: {
    fontSize: 14,
    color: '#8080B0',
    marginTop: 12,
    textAlign: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#8080B0',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  answerScroll: {
    maxHeight: 280,
    width: '100%',
    marginBottom: 24,
  },
  answerScrollContent: {
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
  },
  answerText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 30,
    textAlign: 'center',
  },
  listenButton: {
    backgroundColor: '#5B4FCF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#5B4FCF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});