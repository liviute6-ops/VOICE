/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Mic, 
  Play, 
  Download, 
  Settings, 
  Volume2, 
  User, 
  Type, 
  RefreshCw, 
  AlertCircle,
  Key,
  MessageSquare,
  FileText,
  Zap,
  Clock,
  UserPlus,
  Image as ImageIcon,
  HelpCircle,
  Facebook,
  MessageCircle,
  ChevronDown,
  RotateCcw,
  Info,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  previewUrl?: string;
  tags?: string[];
}

const DEFAULT_VOICES: Voice[] = [
  { id: 'hn-quynh-anh', name: 'Quỳnh Anh', gender: 'female', language: 'vi-VN' },
  { id: 'hn-manh-dung', name: 'Mạnh Dũng', gender: 'male', language: 'vi-VN' },
  { id: 'hn-diem-my', name: 'Diễm My', gender: 'female', language: 'vi-VN' },
  { id: 'hn-minh-quan', name: 'Minh Quân', gender: 'male', language: 'vi-VN' },
  { id: 'sg-lan-anh', name: 'Lan Anh', gender: 'female', language: 'vi-VN' },
  { id: 'sg-minh-hoang', name: 'Minh Hoàng', gender: 'male', language: 'vi-VN' },
  { id: 'sg-thu-thao', name: 'Thu Thảo', gender: 'female', language: 'vi-VN' },
  { id: 'sg-quoc-bao', name: 'Quốc Bảo', gender: 'male', language: 'vi-VN' },
  { id: 'hue-huong-giang', name: 'Hương Giang', gender: 'female', language: 'vi-VN' },
  { id: 'hue-duy-tan', name: 'Duy Tân', gender: 'male', language: 'vi-VN' },
  { id: 'en-us-1', name: 'James (English)', gender: 'male', language: 'en-US' },
  { id: 'en-us-2', name: 'Mary (English)', gender: 'female', language: 'en-US' },
  { id: 'zh-cn-1', name: 'Li Wei (Chinese)', gender: 'male', language: 'zh-CN' },
  { id: 'zh-cn-2', name: 'Mei Ling (Chinese)', gender: 'female', language: 'zh-CN' },
];

const MODELS = [
  { id: 'lingual_speech_v1', name: 'Lingual Speech V1 (Nhân bản)' },
  { id: 'lingual_speech_base', name: 'Lingual Speech Base (Đa ngôn ngữ)' },
  { id: 'jeck_speech', name: 'Jeck Speech (EN/ZH/JA/KO)' },
];

const CLONE_MODELS = [
  { id: 'lingual_speech_v1', name: 'Lingual Speech V1' },
  { id: 'jeck_speech', name: 'Jeck Speech' },
];

export default function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICES[0].id);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [apiKey, setApiKey] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('/api/proxy/tts/submit');
  const [apiModels, setApiModels] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('Chuyển Văn Bản');
  const [splitType, setSplitType] = useState('prefix');
  const [exportSrt, setExportSrt] = useState(false);
  const [enableDuration, setEnableDuration] = useState(true);
  const [commaDur, setCommaDur] = useState(0.3);
  const [dotDur, setDotDur] = useState(0.5);
  const [exclamDur, setExclamDur] = useState(0.6);
  const [questionDur, setQuestionDur] = useState(0.5);
  const [history, setHistory] = useState<{id: string, text: string, voice: string, url: string, date: string}[]>([]);
  const [credits, setCredits] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalTab, setVoiceModalTab] = useState<'available' | 'cloned'>('available');
  const [segments, setSegments] = useState<{id: string, text: string, voice: string, characterName?: string}[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);
  const [isolateVoiceId, setIsolateVoiceId] = useState<string | null>(null); // This will store either characterName or voiceId
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const shouldStopPlayback = useRef(false);
  
  // User Registration State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Voice Cloning State
  const [clonedVoices, setClonedVoices] = useState<{id: string, name: string, status: string, gender?: string, language?: string, previewUrl?: string}[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [editingVoiceName, setEditingVoiceName] = useState('');
  const [selectedCloneModel, setSelectedCloneModel] = useState(CLONE_MODELS[0].id);
  const [selectedGender, setSelectedGender] = useState('male');

  const fetchApiInfo = async (key: string) => {
    if (!key) {
      setError('Vui lòng nhập API Key');
      return;
    }
    const cleanKey = key.trim();
    setIsFetchingInfo(true);
    setError(null);
    console.log('Bắt đầu cập nhật thông tin API...');

    try {
      // Check if we are on a host that supports the proxy
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isDevServer = window.location.hostname.includes('asia-southeast1.run.app');
      const isStaticHost = window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app');

      if (isStaticHost && !isDevServer && !isLocalhost) {
        console.warn('Cảnh báo: Bạn đang chạy ứng dụng trên một nền tảng tĩnh (GitHub Pages/Vercel Static). Proxy API có thể không hoạt động nếu không được cấu hình đúng.');
      }

      // Fetch System Voices
      console.log('Đang tải danh sách giọng đọc hệ thống...');
      const voicesRes = await fetch('/api/proxy/voices?limit=100', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      
      let voicesData: any = {};
      try {
        voicesData = await voicesRes.json();
      } catch (e) {
        const text = await voicesRes.clone().text().catch(() => '');
        console.error('Lỗi khi parse JSON từ /api/proxy/voices:', text.substring(0, 200));
        voicesData = { message: `Không thể đọc dữ liệu từ API (Status: ${voicesRes.status})`, details: text.substring(0, 100) };
      }
      
      if (voicesRes.status === 401) {
        throw new Error('API Key (PAT token) không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần cài đặt.');
      }

      if (!voicesRes.ok) {
        throw new Error(`Lỗi tải danh sách giọng đọc (${voicesRes.status}): ${voicesData.message || voicesRes.statusText}${voicesData.details ? ` - ${voicesData.details}` : ''}`);
      }

      let systemVoices: any[] = [];
      if (voicesData.data) {
        if (voicesData.data.items) {
          systemVoices = voicesData.data.items;
        } else if (Array.isArray(voicesData.data)) {
          systemVoices = voicesData.data;
        }
      }

      // Fetch My Voices (Cloned)
      console.log('Đang tải danh sách giọng đọc cá nhân...');
      const myVoicesRes = await fetch('/api/proxy/voices/my-voices?limit=100', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      
      let myVoices: any[] = [];
      if (myVoicesRes.ok) {
        const myVoicesData = await myVoicesRes.json().catch(() => ({}));
        if (myVoicesData.data) {
          if (myVoicesData.data.items) {
            myVoices = myVoicesData.data.items.map((v: any) => ({ ...v, type: 'clone' }));
          } else if (Array.isArray(myVoicesData.data)) {
            myVoices = myVoicesData.data.map((v: any) => ({ ...v, type: 'clone' }));
          }
        }
      }

      const allVoices = [...systemVoices, ...myVoices];

      if (allVoices.length > 0) {
        setVoices(allVoices);
        localStorage.setItem('maziao_voices', JSON.stringify(allVoices));
        
        // Filter cloned voices
        const clones = allVoices.filter((v: any) => v.type === 'clone' || (v.tags && v.tags.includes('clone')) || v.userId !== null);
        if (clones.length > 0) {
          const mappedClones = clones.map((v: any) => ({
            id: v.id,
            name: v.name,
            status: v.status || 'Hoàn thành',
            gender: v.gender,
            language: v.language,
            previewUrl: v.previewUrl || v.refFile
          }));
          setClonedVoices(mappedClones);
          localStorage.setItem('maziao_cloned_voices', JSON.stringify(mappedClones));
        }

        // If current selected voice is a default one, switch to the first real one
        if (DEFAULT_VOICES.some(v => v.id === selectedVoice)) {
          setSelectedVoice(allVoices[0].id);
        }
        console.log(`Đã tải tổng cộng ${allVoices.length} giọng đọc.`);
      }

      // Fetch Models
      console.log('Đang tải danh sách mô hình TTS...');
      const modelsRes = await fetch('/api/proxy/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json().catch(() => ({}));
        if (modelsData.data) {
          setApiModels(modelsData.data);
          if (modelsData.data.length > 0 && !modelsData.data.some((m: any) => m.id === selectedModel)) {
            setSelectedModel(modelsData.data[0].id);
          }
          console.log(`Đã tải ${modelsData.data.length} mô hình TTS.`);
        }
      }

      // Fetch User Info (Credits)
      console.log('Đang tải thông tin tài khoản...');
      const userRes = await fetch('/api/proxy/me', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      
      const userDataRes = await userRes.json().catch(async () => {
        const text = await userRes.clone().text().catch(() => '');
        return { message: `Không thể đọc dữ liệu người dùng (Status: ${userRes.status})`, details: text.substring(0, 100) };
      });
      
      if (userRes.ok) {
        if (userDataRes.data) {
          setUserData(userDataRes.data);
          setCredits(userDataRes.data.credits || 0);
          localStorage.setItem('maziao_user_data', JSON.stringify(userDataRes.data));
          localStorage.setItem('maziao_credits', (userDataRes.data.credits || 0).toString());
          console.log('Đã cập nhật thông tin tài khoản thành công.');
        }
      } else {
        const errorMsg = userDataRes.message || userRes.statusText || 'Lỗi không xác định';
        if (userRes.status === 404) {
          throw new Error(`Máy chủ proxy không hoạt động (404). Vui lòng kiểm tra lại cấu hình triển khai.`);
        } else {
          throw new Error(`Lỗi kết nối tài khoản: ${errorMsg}`);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật thông tin API:', err);
      setError(err.message || 'Lỗi không xác định khi kết nối API');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.msg || 'Đăng ký thành công!');
        setRegUsername('');
        setRegPassword('');
        setActiveTab('Cài đặt');
        setShowSettings(true);
      } else {
        throw new Error(data.msg || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đăng ký người dùng.');
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('maziao_api_key');
    const savedBaseUrl = localStorage.getItem('maziao_api_base_url');
    const savedCloned = localStorage.getItem('maziao_cloned_voices');
    const savedHistory = localStorage.getItem('maziao_history');
    const savedVoices = localStorage.getItem('maziao_voices');
    const savedCredits = localStorage.getItem('maziao_credits');
    const savedUserData = localStorage.getItem('maziao_user_data');

    if (savedKey) {
      const trimmedKey = savedKey.trim();
      const finalKey = trimmedKey.startsWith('Bearer ') ? trimmedKey.slice(7).trim() : trimmedKey;
      setApiKey(finalKey);
      fetchApiInfo(finalKey);
    }
    if (savedBaseUrl) setApiBaseUrl(savedBaseUrl);
    if (savedCloned) setClonedVoices(JSON.parse(savedCloned));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedVoices) setVoices(JSON.parse(savedVoices));
    if (savedCredits) setCredits(parseInt(savedCredits));
    if (savedUserData) setUserData(JSON.parse(savedUserData));
  }, []);

  const handleSplit = () => {
    if (!text.trim()) return;
    
    let newSegments: {id: string, text: string, voice: string, characterName?: string}[] = [];
    
    if (splitType === 'line1') {
      newSegments = text.split('\n').filter(p => p.trim()).map((p, i) => ({
        id: i.toString(),
        text: p.trim(),
        voice: selectedVoice
      }));
    } else if (splitType === 'line2') {
      newSegments = text.split('\n\n').filter(p => p.trim()).map((p, i) => ({
        id: i.toString(),
        text: p.trim(),
        voice: selectedVoice
      }));
    } else if (splitType === 'prefix') {
      // Smart detection for dialogue
      const lines = text.split('\n').filter(l => l.trim());
      let currentId = 0;
      
      lines.forEach(line => {
        // Pattern 1: [Name]: Text
        const bracketMatch = line.match(/^\[([^\]]+)\]:\s*(.*)/);
        if (bracketMatch) {
          const voiceName = bracketMatch[1].trim();
          // Try to find a matching voice ID if it's already a voice ID
          const matchedVoice = voices.find(v => v.name.toLowerCase() === voiceName.toLowerCase() || v.id === voiceName);
          newSegments.push({
            id: (currentId++).toString(),
            voice: matchedVoice ? matchedVoice.id : voiceName,
            characterName: voiceName,
            text: bracketMatch[2].trim()
          });
          return;
        }
        
        // Pattern 2: Name: Text (Name should be short, like 1-3 words)
        const colonMatch = line.match(/^([^:]{1,30}):\s*(.*)/);
        if (colonMatch) {
          const voiceName = colonMatch[1].trim();
          const matchedVoice = voices.find(v => v.name.toLowerCase() === voiceName.toLowerCase() || v.id === voiceName);
          newSegments.push({
            id: (currentId++).toString(),
            voice: matchedVoice ? matchedVoice.id : voiceName,
            characterName: voiceName,
            text: colonMatch[2].trim()
          });
          return;
        }
        
        // Pattern 3: - Text
        const dashMatch = line.match(/^- \s*(.*)/);
        if (dashMatch) {
          newSegments.push({
            id: (currentId++).toString(),
            voice: selectedVoice,
            text: dashMatch[1].trim()
          });
          return;
        }
        
        // Default
        newSegments.push({
          id: (currentId++).toString(),
          voice: selectedVoice,
          text: line.trim()
        });
      });
    } else {
      newSegments = [{ id: '0', text: text, voice: selectedVoice }];
    }

    setSegments(newSegments);
  };

  const saveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    // If user pasted "Bearer token", extract just the token
    const finalKey = trimmedKey.startsWith('Bearer ') ? trimmedKey.slice(7).trim() : trimmedKey;
    
    setApiKey(finalKey);
    localStorage.setItem('maziao_api_key', finalKey);
  };

  const saveApiBaseUrl = (url: string) => {
    setApiBaseUrl(url);
    localStorage.setItem('maziao_api_base_url', url);
  };

  const addToHistory = (item: {text: string, voice: string, url: string}) => {
    const newItem = {
      id: Date.now().toString(),
      ...item,
      date: new Date().toLocaleString('vi-VN')
    };
    const updatedHistory = [newItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('maziao_history', JSON.stringify(updatedHistory));
  };

  // Function to download audio with specific character only
  const downloadCharacterAudio = async (targetCharName: string | null) => {
    if (segments.length === 0) return;
    
    try {
      toast.loading("Đang xử lý âm thanh...");
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffers: AudioBuffer[] = [];
      
      const finalSegments = segments.filter(s => s.audioUrl);
      if (finalSegments.length === 0) {
        toast.error("Vui lòng chuyển đổi văn bản trước.");
        return;
      }

      for (const seg of finalSegments) {
        const audioRes = await fetch(seg.audioUrl!);
        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // If targetCharName is provided, mute segments that don't match
        if (targetCharName && seg.characterName !== targetCharName) {
          const silentBuffer = audioContext.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
          );
          audioBuffers.push(silentBuffer);
        } else {
          audioBuffers.push(buffer);
        }
      }
      
      if (audioBuffers.length > 0) {
        const mergedBuffer = mergeAudioBuffers(audioBuffers, audioContext);
        const wavBlob = bufferToWav(mergedBuffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetCharName ? `audio_${targetCharName}.wav` : `audio_merged.wav`;
        a.click();
        URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Tải xuống thành công!");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.dismiss();
      toast.error("Lỗi khi xử lý âm thanh. Vui lòng thử lại.");
    }
  };

  // Helper to convert AudioBuffer to WAV
  const bufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const buffer_arr = new ArrayBuffer(length);
    const view = new DataView(buffer_arr);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    for(i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++;                                     // next source sample
    }

    return new Blob([buffer_arr], {type: "audio/wav"});
  };

  const trimAudioFile = async (file: File): Promise<File> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const maxDuration = 8; // seconds
      if (audioBuffer.duration <= maxDuration) {
        return file; // No need to trim
      }
      
      toast.loading("Đang tự động cắt âm thanh xuống 8 giây...", { id: 'trim-status' });
      
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const numFrames = Math.floor(maxDuration * sampleRate);
      
      const trimmedBuffer = audioContext.createBuffer(numChannels, numFrames, sampleRate);
      
      for (let i = 0; i < numChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedChannelData = trimmedBuffer.getChannelData(i);
        trimmedChannelData.set(channelData.subarray(0, numFrames));
      }
      
      const wavBlob = bufferToWav(trimmedBuffer);
      const trimmedFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, "") + "_trimmed.wav", { type: 'audio/wav' });
      
      toast.success("Đã cắt âm thanh xuống 8 giây!", { id: 'trim-status' });
      return trimmedFile;
    } catch (error) {
      console.error("Error trimming audio:", error);
      toast.error("Không thể cắt âm thanh. Vui lòng thử lại với tệp khác.", { id: 'trim-status' });
      return file;
    }
  };

  const handleCloneVoice = async () => {
    if (!apiKey) {
      setError('Vui lòng nhập API Key trong phần cài đặt.');
      setShowSettings(true);
      return;
    }
    if (!cloneName || !selectedFile) {
      setError('Vui lòng nhập tên và chọn tệp âm thanh mẫu.');
      return;
    }

    setIsCloning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', cloneName);
      formData.append('refFile', selectedFile);
      formData.append('gender', selectedGender);
      formData.append('model', selectedCloneModel);

      const response = await fetch('/api/proxy/voices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.data) {
        const newVoice = {
          id: data.data.id,
          name: data.data.name,
          status: data.data.status || 'Hoàn thành'
        };
        
        const updatedVoices = [...clonedVoices, newVoice];
        setClonedVoices(updatedVoices);
        localStorage.setItem('maziao_cloned_voices', JSON.stringify(updatedVoices));
        
        setCloneName('');
        setSelectedFile(null);
        alert('Nhân bản giọng nói thành công!');
        // Refresh voices list
        fetchApiInfo(apiKey);
      } else {
        throw new Error(data.msg || data.message || 'Lỗi khi nhân bản giọng nói.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nhân bản giọng nói. Vui lòng thử lại.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!apiKey) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa giọng nói này?')) return;

    try {
      const response = await fetch(`/api/proxy/voices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        const updatedVoices = clonedVoices.filter(v => v.id !== id);
        setClonedVoices(updatedVoices);
        localStorage.setItem('maziao_cloned_voices', JSON.stringify(updatedVoices));
        fetchApiInfo(apiKey);
      } else {
        const data = await response.json();
        throw new Error(data.msg || data.message || 'Lỗi khi xóa giọng nói.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa giọng nói.');
    }
  };

  // Automatically re-merge audio when isolation settings change
  useEffect(() => {
    const reMerge = async () => {
      const allHaveAudio = segments.length > 0 && segments.every(s => s.audioUrl);
      if (!allHaveAudio) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffers: AudioBuffer[] = [];
        
        for (const seg of segments) {
          const audioRes = await fetch(seg.audioUrl!);
          const arrayBuffer = await audioRes.arrayBuffer();
          const buffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const currentSegKey = getSegmentVoiceKey(seg);
          if (isolateVoiceId && currentSegKey !== isolateVoiceId) {
            const silentBuffer = audioContext.createBuffer(
              buffer.numberOfChannels,
              buffer.length,
              buffer.sampleRate
            );
            audioBuffers.push(silentBuffer);
          } else {
            audioBuffers.push(buffer);
          }
        }

        if (audioBuffers.length > 0) {
          const mergedBuffer = mergeAudioBuffers(audioBuffers, audioContext);
          const wavBlob = bufferToWav(mergedBuffer);
          const finalUrl = URL.createObjectURL(wavBlob);
          setAudioUrl(finalUrl);
        }
      } catch (err) {
        console.error('Auto-merge error:', err);
      }
    };

    reMerge();
  }, [isolateVoiceId]);

  const handleUpdateVoice = async (id: string) => {
    if (!apiKey || !editingVoiceName.trim()) return;

    try {
      const response = await fetch(`/api/proxy/voices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ name: editingVoiceName }),
      });

      if (response.ok) {
        setEditingVoiceId(null);
        setEditingVoiceName('');
        fetchApiInfo(apiKey);
      } else {
        const data = await response.json();
        throw new Error(data.msg || data.message || 'Lỗi khi cập nhật giọng nói.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật giọng nói.');
    }
  };

  const pollStatus = (id: string, key: string): Promise<{audioUrl: string, srtUrl?: string}> => {
    return new Promise((resolve, reject) => {
      const maxRetries = 120; // 120 retries * 2 seconds = 240 seconds
      let retries = 0;

      const interval = setInterval(async () => {
        retries++;
        try {
          const response = await fetch('/api/proxy/tts/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({ ids: [id] }),
          });

          const result = await response.json();
          
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const task = result.data.find((t: any) => t.id === id);
            if (task) {
              const { status, resultUrl, srtUrl: taskSrtUrl } = task;
              
              if (status === 'completed' && resultUrl) {
                clearInterval(interval);
                resolve({ audioUrl: resultUrl, srtUrl: taskSrtUrl });
              } else if (status === 'failed') {
                clearInterval(interval);
                reject(new Error('Lỗi tạo giọng nói trên máy chủ.'));
              }
            }
          }
          
          if (retries >= maxRetries) {
            clearInterval(interval);
            reject(new Error('Quá thời gian chờ tạo giọng nói.'));
          }
        } catch (err) {
          console.error('Polling error:', err);
          // Don't stop on network error, just retry
        }
      }, 2000);
    });
  };

  // Helper to merge multiple AudioBuffers
  const mergeAudioBuffers = (buffers: AudioBuffer[], audioContext: AudioContext) => {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const mergedBuffer = audioContext.createBuffer(
      buffers[0].numberOfChannels,
      totalLength,
      buffers[0].sampleRate
    );

    let offset = 0;
    buffers.forEach(buf => {
      for (let channel = 0; channel < buf.numberOfChannels; channel++) {
        mergedBuffer.getChannelData(channel).set(buf.getChannelData(channel), offset);
      }
      offset += buf.length;
    });

    return mergedBuffer;
  };

  // Helper to get a unique key for a segment's voice/character
  const getSegmentVoiceKey = (seg: {voice: string, characterName?: string}) => {
    return seg.characterName || seg.voice || selectedVoice;
  };

  // Function to play all segments sequentially
  const playAllSegments = async (startIndex = 0) => {
    // Stop any existing playback
    shouldStopPlayback.current = true;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    // Small delay to ensure previous loop stops
    await new Promise(resolve => setTimeout(resolve, 100));
    shouldStopPlayback.current = false;

    const segmentsToPlay = segments.slice(startIndex).filter(s => s.audioUrl);
    if (segmentsToPlay.length === 0) {
      toast.error("Vui lòng chuyển đổi văn bản trước khi nghe.");
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    for (const seg of segmentsToPlay) {
      if (shouldStopPlayback.current) break;
      
      setPlayingSegmentId(seg.id);
      
      const currentSegKey = getSegmentVoiceKey(seg);
      const isIsolated = isolateVoiceId && currentSegKey !== isolateVoiceId;

      await new Promise((resolve) => {
        if (isIsolated) {
          // If isolated and not this character, just wait for the duration
          // We need to fetch the audio to know the duration
          fetch(seg.audioUrl!).then(res => res.arrayBuffer()).then(ab => audioContext.decodeAudioData(ab)).then(buffer => {
            setTimeout(() => {
              resolve(null);
            }, buffer.duration * 1000);
          }).catch(() => resolve(null));
        } else {
          const audio = new Audio(seg.audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => {
            currentAudioRef.current = null;
            resolve(null);
          };
          audio.onerror = () => {
            currentAudioRef.current = null;
            resolve(null);
          };
          audio.play().catch(() => {
            currentAudioRef.current = null;
            resolve(null);
          });
        }
      });
    }
    
    if (!shouldStopPlayback.current) {
      setPlayingSegmentId(null);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Vui lòng nhập API Key trong phần cài đặt.');
      setShowSettings(true);
      return;
    }

    const textToConvert = segments.length > 0 
      ? segments.map(s => s.text).join(' ') 
      : text;

    if (!textToConvert.trim()) {
      setError('Vui lòng nhập văn bản cần chuyển đổi.');
      return;
    }

    // The API requires at least 100 characters. We'll handle this by padding if needed.
    if (textToConvert.length < 1) {
      setError('Vui lòng nhập văn bản cần chuyển đổi.');
      return;
    }

    if (textToConvert.length > 250000) {
      setError('Văn bản quá dài. API chỉ hỗ trợ tối đa 250.000 ký tự. Vui lòng chia nhỏ văn bản.');
      return;
    }

    if (!selectedModel) {
      setError('Vui lòng chọn một mô hình.');
      return;
    }

    if (!selectedVoice) {
      setError('Vui lòng chọn một giọng nói.');
      return;
    }

    if (DEFAULT_VOICES.some(v => v.id === selectedVoice)) {
      setError('Vui lòng chọn một giọng nói thực tế từ danh sách (không phải giọng mặc định). Nhấn "Làm mới" trong cài đặt nếu không thấy giọng nói.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setSrtUrl(null);
    
    try {
      const validSegments = segments.filter(s => s.text && s.text.trim());
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (validSegments.length > 0) {
        // Process in batches of 5 for concurrency
        const batchSize = 5;
        const updatedSegments = [...segments];
        
        // Only process segments that don't have an audioUrl yet
        const segmentsToFetch = validSegments.filter(s => !s.audioUrl);
        
        if (segmentsToFetch.length > 0) {
          for (let i = 0; i < segmentsToFetch.length; i += batchSize) {
            const batch = segmentsToFetch.slice(i, i + batchSize);
            toast.loading(`Đang xử lý nhóm ${Math.floor(i/batchSize) + 1}/${Math.ceil(segmentsToFetch.length/batchSize)}...`, { id: 'gen-status' });
            
            // Process batch in parallel
            const batchPromises = batch.map(async (seg) => {
              const payload = {
                mode: "paragraph",
                parts: [{
                  startTime: 0,
                  endTime: 10,
                  text: seg.text.length < 100 ? seg.text.padEnd(99, ' ') + '.' : seg.text,
                  voiceId: seg.voice || selectedVoice
                }],
                voiceId: seg.voice || selectedVoice,
                previewText: seg.text.slice(0, 50),
                metadata: {
                  speed: speed,
                  volume: volume,
                  pitch: pitch,
                  enable_duration: enableDuration,
                  comma_dur: commaDur,
                  dot_dur: dotDur,
                  exclam_dur: exclamDur,
                  question_dur: questionDur,
                  export_srt: exportSrt
                },
                modelId: selectedModel
              };

              const response = await fetch('/api/proxy/tts/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(payload),
              });

              const data = await response.json().catch(() => ({ message: 'Không thể đọc phản hồi từ máy chủ.' }));
              
              if (response.ok && data.data && (data.data.taskId || data.data.id)) {
                const result = await pollStatus(data.data.taskId || data.data.id, apiKey);
                
                // Update segment in our local copy
                const segIdx = updatedSegments.findIndex(s => s.id === seg.id);
                if (segIdx !== -1) {
                  updatedSegments[segIdx] = { ...updatedSegments[segIdx], audioUrl: result.audioUrl };
                  setSegments([...updatedSegments]);
                }
                return result.audioUrl;
              } else {
                const errorMsg = data.msg || data.message || data.error || data.error_message || data.error_msg || data.error_description || (typeof data === 'object' ? JSON.stringify(data) : 'Có lỗi xảy ra khi gọi API.');
                throw new Error(errorMsg);
              }
            });

            await Promise.all(batchPromises);
          }
        }

        // Merge all audio results
        toast.loading("Đang gộp toàn bộ âm thanh...", { id: 'gen-status' });
        const audioBuffers: AudioBuffer[] = [];
        const finalSegments = updatedSegments.filter(s => s.audioUrl);
        
        for (const seg of finalSegments) {
          if (seg.audioUrl) {
            const audioRes = await fetch(seg.audioUrl);
            const arrayBuffer = await audioRes.arrayBuffer();
            const buffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Check if we need to isolate a voice
            const currentSegKey = getSegmentVoiceKey(seg);
            if (isolateVoiceId && currentSegKey !== isolateVoiceId) {
              // Replace with silence of the same duration
              const silentBuffer = audioContext.createBuffer(
                buffer.numberOfChannels,
                buffer.length,
                buffer.sampleRate
              );
              audioBuffers.push(silentBuffer);
            } else {
              audioBuffers.push(buffer);
            }
          }
        }

        if (audioBuffers.length > 0) {
          const mergedBuffer = mergeAudioBuffers(audioBuffers, audioContext);
          const wavBlob = bufferToWav(mergedBuffer);
          const finalUrl = URL.createObjectURL(wavBlob);
          setAudioUrl(finalUrl);
        }
      } else {
        // Single text generation
        toast.loading("Đang xử lý văn bản...", { id: 'gen-status' });
        const payload = {
          mode: "paragraph",
          parts: [{
            startTime: 0,
            endTime: 10,
            text: textToConvert.length < 100 ? textToConvert.padEnd(99, ' ') + '.' : textToConvert,
            voiceId: selectedVoice
          }],
          voiceId: selectedVoice,
          previewText: textToConvert.slice(0, 50),
          metadata: {
            speed: speed,
            volume: volume,
            pitch: pitch,
            enable_duration: enableDuration,
            comma_dur: commaDur,
            dot_dur: dotDur,
            exclam_dur: exclamDur,
            question_dur: questionDur,
            export_srt: exportSrt
          },
          modelId: selectedModel
        };

        const response = await fetch('/api/proxy/tts/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({ message: 'Không thể đọc phản hồi từ máy chủ.' }));
        
        if (response.ok && data.data && (data.data.taskId || data.data.id)) {
          const result = await pollStatus(data.data.taskId || data.data.id, apiKey);
          
          const audioRes = await fetch(result.audioUrl);
          const arrayBuffer = await audioRes.arrayBuffer();
          const buffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const wavBlob = bufferToWav(buffer);
          const finalUrl = URL.createObjectURL(wavBlob);
          
          setAudioUrl(finalUrl);
          if (result.srtUrl) setSrtUrl(result.srtUrl);
          
          addToHistory({ 
            text: textToConvert.slice(0, 100) + '...', 
            voice: voices.find(v => v.id === selectedVoice)?.name || selectedVoice, 
            url: finalUrl 
          });
          
          fetchApiInfo(apiKey);
          toast.success("Hoàn thành!", { id: 'gen-status' });
        } else {
          const errorMsg = data.msg || data.message || data.error || data.error_message || data.error_msg || data.error_description || (typeof data === 'object' ? JSON.stringify(data) : 'Có lỗi xảy ra khi gọi API.');
          throw new Error(errorMsg);
        }
      }
    } catch (err: any) {
      console.error('TTS Error:', err);
      setError(err.message || 'Có lỗi xảy ra.');
      toast.error(err.message || 'Có lỗi xảy ra.', { id: 'gen-status' });
    } finally {
      setIsGenerating(false);
    }
  };

  const sidebarItems = [
    { name: 'Chuyển Văn Bản', icon: <FileText size={18} /> },
    { name: 'Chuyển Phụ Đề', icon: <FileText size={18} /> },
    { name: 'Hội Thoại', icon: <MessageSquare size={18} />, badge: 'Mới' },
    { name: 'Phụ Đề Tự Động', icon: <Mic size={18} /> },
    { name: 'Nhân Bản Giọng', icon: <User size={18} /> },
    { name: 'Tạo Ảnh', icon: <ImageIcon size={18} /> },
    { name: 'Nạp Credits', icon: <Zap size={18} />, badge: '+10%' },
    { name: 'Giới thiệu bạn bè', icon: <UserPlus size={18} /> },
  ];

  const renderContent = () => {
    if (activeTab === 'Thành viên') {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Section */}
            <div className="bg-[#1a1c2e] rounded-3xl border border-slate-700/50 shadow-xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Thông tin tài khoản</h3>
                  <p className="text-sm text-slate-400">Quản lý thông tin cá nhân của bạn</p>
                </div>
              </div>

              {userData ? (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between py-3 border-b border-slate-700/30">
                    <span className="text-sm font-medium text-slate-500">Email</span>
                    <span className="text-sm font-bold text-white">{userData.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-700/30">
                    <span className="text-sm font-medium text-slate-500">ID người dùng</span>
                    <span className="text-sm font-mono text-white">{userData.id}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-700/30">
                    <span className="text-sm font-medium text-slate-500">Trạng thái</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded uppercase border border-green-500/20">{userData.status}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-700/30">
                    <span className="text-sm font-medium text-slate-500">Vai trò</span>
                    <span className="text-sm font-bold text-blue-400 uppercase">{userData.role}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-700/30">
                    <span className="text-sm font-medium text-slate-500">Ngày tạo</span>
                    <span className="text-sm font-bold text-white">{new Date(userData.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="pt-4">
                    <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap size={20} className="text-blue-400" fill="currentColor" />
                        <span className="text-sm font-bold text-blue-300">Số dư Credits</span>
                      </div>
                      <span className="text-xl font-black text-blue-400">{credits.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-4">
                  <p className="text-slate-400">Vui lòng nhập API Key trong phần cài đặt để xem thông tin tài khoản.</p>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                  >
                    Đi tới Cài đặt
                  </button>
                </div>
              )}
            </div>

            {/* Register Section */}
            <div className="bg-[#1a1c2e] rounded-3xl border border-slate-700/50 shadow-xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Đăng ký thành viên</h3>
                  <p className="text-sm text-slate-400">Tạo tài khoản mới để bắt đầu</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tên đăng nhập</label>
                  <input 
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f111a] border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mật khẩu</label>
                  <input 
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f111a] border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button 
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                    isRegistering 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/20'
                  }`}
                >
                  {isRegistering ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />}
                  <span>Đăng ký ngay</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center italic">
                  * Đăng ký bằng tên đăng nhập và mật khẩu sẽ không nhận được credits thưởng.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Phụ Đề Tự Động') {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-8 bg-[#1a1c2e] rounded-3xl border border-slate-700/50 shadow-xl">
          <div className="p-6 bg-blue-500/10 text-blue-400 rounded-full">
            <Mic size={64} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Tạo phụ đề tự động</h3>
            <p className="text-slate-400 max-w-md">Tải lên video hoặc âm thanh để AI tự động trích xuất phụ đề chính xác.</p>
          </div>
          
          <div className="w-full max-w-xl px-8">
            <div className="border-2 border-dashed border-slate-700/50 rounded-3xl p-12 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group bg-[#0f111a]">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-800 text-slate-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Download size={32} className="rotate-180" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-300">Kéo thả tệp vào đây hoặc nhấp để chọn</div>
                  <div className="text-sm text-slate-500">Hỗ trợ MP4, MP3, WAV, MOV (Tối đa 500MB)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Giới thiệu bạn bè') {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-[#1a1c2e] p-10 rounded-[40px] border border-slate-700/50 shadow-xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="inline-flex p-5 bg-blue-500/10 text-blue-400 rounded-3xl mb-4">
              <UserPlus size={48} />
            </div>
            <h3 className="text-3xl font-black text-white">Mời bạn bè, nhận Credits miễn phí</h3>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
              Chia sẻ mã giới thiệu của bạn với bạn bè. Khi họ đăng ký và sử dụng dịch vụ, cả hai sẽ nhận được thêm Credits vào tài khoản.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <div className="flex-1 max-w-md w-full bg-[#0f111a] border border-slate-700 rounded-2xl px-6 py-4 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                <span className="font-mono font-bold text-xl text-blue-400 tracking-widest">VOICE-OFFICE-V1.0</span>
                <button className="text-slate-500 hover:text-blue-400 transition-colors">
                  <RefreshCw size={20} />
                </button>
              </div>
              <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                <Zap size={20} />
                Sao chép mã
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Gửi lời mời', desc: 'Chia sẻ mã giới thiệu hoặc link đăng ký cho bạn bè của bạn.' },
              { title: 'Bạn bè đăng ký', desc: 'Bạn bè của bạn tạo tài khoản và xác thực thông tin.' },
              { title: 'Nhận phần thưởng', desc: 'Cả bạn và người được giới thiệu đều nhận được Credits.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#1a1c2e] p-6 rounded-2xl border border-slate-700/50 shadow-sm space-y-3">
                <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold">{i + 1}</div>
                <h4 className="font-bold text-white">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'Nhân Bản Giọng') {
      return (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white">Nhân bản giọng nói</h2>
          
          <div className="flex gap-6 items-start">
            {/* Left Panel - Configuration */}
            <div className="w-[350px] shrink-0 bg-[#1a1c2e] text-white rounded-2xl border border-slate-700/50 p-6 space-y-6 shadow-xl">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">Chọn mô hình</label>
                <div className="relative">
                  <select 
                    value={selectedCloneModel}
                    onChange={(e) => setSelectedCloneModel(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  >
                    {CLONE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-[11px] text-blue-300 leading-relaxed">
                    Ngôn ngữ được hỗ trợ: Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Hindi, Tiếng Pháp, Tiếng Thụy Sĩ... <span className="text-blue-400 cursor-pointer hover:underline">Xem thêm</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">
                  <span className="text-red-500 mr-1">*</span>Tên giọng nói
                </label>
                <input 
                  type="text" 
                  placeholder="Nhập tên giọng nói"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">
                  <span className="text-red-500 mr-1">*</span>Chọn giới tính
                </label>
                <div className="relative">
                  <select 
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">
                  <span className="text-red-500 mr-1">*</span>Tải lên tệp âm thanh
                </label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer bg-[#0f111a] ${
                    selectedFile ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'
                  }`}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input 
                    id="fileInput"
                    type="file" 
                    accept="audio/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const processedFile = await trimAudioFile(file);
                        setSelectedFile(processedFile);
                      } else {
                        setSelectedFile(null);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <Upload size={32} className={selectedFile ? 'text-blue-500' : 'text-slate-500'} />
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-300">
                        {selectedFile ? selectedFile.name : 'Nhấp hoặc kéo để tải lên tại đây'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tự động cắt nếu trên 8 giây, tối đa 1MB<br />
                        Hiện chỉ hỗ trợ: mp3, wav
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = URL.createObjectURL(selectedFile);
                        const audio = new Audio(url);
                        audio.play();
                      }}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-blue-300 truncate">{selectedFile.name}</div>
                      <div className="text-[10px] text-blue-400/60">Sẵn sàng để nhân bản</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCloneVoice}
                disabled={isCloning || !cloneName || !selectedFile}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${
                  isCloning || !cloneName || !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                }`}
              >
                {isCloning ? <RefreshCw size={18} className="animate-spin mx-auto" /> : 'Nhân bản giọng nói'}
              </button>
            </div>

            {/* Right Panel - List */}
            <div className="flex-1 bg-[#1a1c2e] text-white rounded-2xl border border-slate-700/50 p-8 min-h-[600px] flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Giọng nói đã nhân bản</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => fetchApiInfo(apiKey)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                  >
                    <RefreshCw size={18} className={isFetchingInfo ? "animate-spin" : ""} />
                  </button>
                  <span className="text-sm text-slate-400">{clonedVoices.length} giọng nói</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                {clonedVoices.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Mic size={32} />
                    </div>
                    <p>Chưa có giọng nói nào được nhân bản.</p>
                  </div>
                ) : (
                  clonedVoices.map((voice) => (
                    <div key={voice.id} className="bg-[#0f111a] border border-slate-700/50 rounded-2xl p-5 space-y-4 hover:border-blue-500/30 transition-all group relative">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {editingVoiceId === voice.id ? (
                            <div className="flex items-center gap-2 w-full pr-8">
                              <input 
                                type="text"
                                value={editingVoiceName}
                                onChange={(e) => setEditingVoiceName(e.target.value)}
                                className="flex-1 bg-[#1a1c2e] border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                              <button 
                                onClick={() => handleUpdateVoice(voice.id)}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => setEditingVoiceId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-500/10 rounded-md"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="font-bold text-lg truncate pr-8">{voice.name}</div>
                          )}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingVoiceId(voice.id);
                                setEditingVoiceName(voice.name);
                              }}
                              className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteVoice(voice.id)}
                              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20">
                            Tiếng Việt
                          </span>
                          <span className="px-2.5 py-0.5 bg-pink-500/10 text-pink-400 text-[10px] font-bold rounded-md border border-pink-500/20">
                            {voice.gender === 'male' ? 'Nam' : voice.gender === 'female' ? 'Nữ' : (voice.gender || 'Nữ')}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/20">
                            Nhân bản
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => {
                            if (voice.previewUrl) {
                              const audio = new Audio(voice.previewUrl);
                              audio.play();
                            } else {
                              toast.error('Không có âm thanh mẫu để nghe thử.');
                            }
                          }}
                          className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedVoice(voice.id);
                            setActiveTab('Chuyển Văn Bản');
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                        >
                          Chuyển văn bản
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination UI */}
              <div className="mt-8 pt-8 border-t border-slate-700/50 flex justify-center items-center gap-4">
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Tạo Ảnh') {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-[#1a1c2e] rounded-3xl border border-slate-700/50 shadow-xl">
          <div className="p-6 bg-purple-500/10 text-purple-400 rounded-full">
            <ImageIcon size={64} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Tạo ảnh nghệ thuật AI</h3>
            <p className="text-slate-400 max-w-md">Tính năng này đang được phát triển và sẽ sớm ra mắt trong thời gian tới.</p>
          </div>
          <button className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20">
            Nhận thông báo khi ra mắt
          </button>
        </div>
      );
    }

    if (activeTab === 'Nạp Credits') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Gói Cơ Bản', price: '100.000đ', credits: '500.000', popular: false },
            { name: 'Gói Phổ Thông', price: '200.000đ', credits: '1.200.000', popular: true },
            { name: 'Gói Cao Cấp', price: '500.000đ', credits: '3.500.000', popular: false },
          ].map((pkg) => (
            <div key={pkg.name} className={`bg-[#1a1c2e] p-8 rounded-3xl border-2 transition-all flex flex-col space-y-6 ${pkg.popular ? 'border-blue-500 shadow-xl shadow-blue-900/20 scale-105 z-10' : 'border-slate-700/50 shadow-sm hover:border-blue-500/30'}`}>
              {pkg.popular && <div className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full self-start">Phổ biến nhất</div>}
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-300">{pkg.name}</h4>
                <div className="text-3xl font-black text-white">{pkg.price}</div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Zap size={20} fill="currentColor" />
                <span>{pkg.credits} Credits</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-400 flex-1">
                <li className="flex items-center gap-2">✓ Không giới hạn thời gian</li>
                <li className="flex items-center gap-2">✓ Hỗ trợ tất cả giọng nói</li>
                <li className="flex items-center gap-2">✓ Ưu tiên xử lý nhanh</li>
              </ul>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${pkg.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                Chọn gói này
              </button>
            </div>
          ))}
        </div>
      );
    }

    // Default: Hội Thoại / Chuyển Văn Bản
    return (
      <div className="flex gap-4 items-start h-full">
        {/* Center Card */}
        <div className="flex-1 bg-[#1a1c2e] rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-slate-700/30 flex justify-between items-center bg-[#1a1c2e]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('Nạp Credits')}
                className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-bold transition-all"
              >
                <Zap size={14} fill="currentColor" />
                <span>Nạp thêm Credits</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={!text.trim() || isGenerating}
                onClick={handleGenerate}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-700/50 rounded-lg hover:bg-slate-700/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={14} />
                <span>Chuyển đổi</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6 relative">
            {segments.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                {/* Voice Isolation Controls */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                    <Mic size={12} />
                    <span>Chế độ tách voice nhân vật:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setIsolateVoiceId(null)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${isolateVoiceId === null ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                      Bình thường
                    </button>
                    {Array.from(new Set(segments.map(s => getSegmentVoiceKey(s)))).map(vKey => {
                      const voiceObj = voices.find(v => v.id === vKey);
                      const voiceName = voiceObj?.name || 'Giọng đọc';
                      const charName = segments.find(s => getSegmentVoiceKey(s) === vKey)?.characterName;
                      return (
                        <button 
                          key={vKey}
                          onClick={() => setIsolateVoiceId(vKey)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${isolateVoiceId === vKey ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                        >
                          Chỉ {charName || voiceName}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 italic">* Khi chọn một nhân vật, các đoạn hội thoại của nhân vật khác sẽ được thay thế bằng khoảng lặng, giữ nguyên tổng thời lượng.</p>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách đoạn hội thoại</h3>
                  <button 
                    onClick={() => {
                      if (playingSegmentId) {
                        shouldStopPlayback.current = true;
                        if (currentAudioRef.current) currentAudioRef.current.pause();
                        setPlayingSegmentId(null);
                      } else {
                        playAllSegments(0);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${playingSegmentId ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30'}`}
                  >
                    {playingSegmentId ? <X size={12} /> : <Play size={12} fill="currentColor" />}
                    <span>{playingSegmentId ? 'Dừng phát' : 'Nghe toàn bộ'}</span>
                  </button>
                </div>
                {segments.map((seg, idx) => (
                  <div key={seg.id} className={`bg-[#0f111a] p-4 rounded-xl border transition-all space-y-3 group relative ${playingSegmentId === seg.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Phần {idx + 1}</div>
                        <button 
                          onClick={() => {
                            setActiveSegmentId(seg.id);
                            setIsVoiceModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 transition-all"
                        >
                          <User size={10} />
                          <span className={`truncate max-w-[120px] ${voices.find(v => v.id === seg.voice) ? 'text-slate-300' : 'text-amber-400'}`}>
                            {seg.characterName ? `${seg.characterName} → ` : ''}
                            {voices.find(v => v.id === seg.voice)?.name || 'Chọn giọng'}
                          </span>
                          <ChevronDown size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {seg.audioUrl && (
                          <button 
                            onClick={() => {
                              if (playingSegmentId === seg.id) {
                                shouldStopPlayback.current = true;
                                if (currentAudioRef.current) currentAudioRef.current.pause();
                                setPlayingSegmentId(null);
                              } else {
                                playAllSegments(idx);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-all ${playingSegmentId === seg.id ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white'}`}
                            title={playingSegmentId === seg.id ? "Dừng" : "Nghe từ đoạn này"}
                          >
                            {playingSegmentId === seg.id ? <X size={12} /> : <Play size={12} fill="currentColor" />}
                          </button>
                        )}
                        <button 
                          onClick={() => setSegments(segments.filter(s => s.id !== seg.id))}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={seg.text}
                      onChange={(e) => {
                        const newSegs = [...segments];
                        newSegs[idx].text = e.target.value;
                        // Clear audioUrl if text changes
                        if (newSegs[idx].audioUrl) {
                          newSegs[idx].audioUrl = undefined;
                        }
                        setSegments(newSegs);
                      }}
                      className="w-full bg-transparent border-none focus:ring-0 text-slate-200 text-sm leading-relaxed resize-none h-16"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setSegments([])}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors border-2 border-dashed border-slate-700/50 rounded-xl"
                >
                  Quay lại nhập văn bản
                </button>
                <div className="flex justify-between items-center px-2 py-1 border-t border-slate-800/50 mt-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${segments.reduce((acc, s) => acc + s.text.length, 0) < 100 ? 'text-amber-500' : 'text-slate-500'}`}>
                      Tổng cộng: {segments.reduce((acc, s) => acc + s.text.length, 0)} / 250.000 ký tự
                    </span>
                    {segments.reduce((acc, s) => acc + s.text.length, 0) < 100 && (
                      <span className="text-[10px] font-medium text-amber-500/80 italic">
                        (Cần thêm {100 - segments.reduce((acc, s) => acc + s.text.length, 0)} ký tự)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={activeTab === 'Hội Thoại' ? "Nhập hoặc dán văn bản tại đây. Sau đó nhấn Chia để phân chia thành các phần." : "Nhập văn bản của bạn tại đây..."}
                  className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-200 text-lg leading-relaxed resize-none placeholder:text-slate-600"
                />
                
                <div className="flex justify-between items-center px-2 py-1 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${text.length < 100 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {text.length} / 250.000 ký tự
                    </span>
                    {text.length > 0 && text.length < 100 && (
                      <span className="text-[10px] font-medium text-amber-500/80 italic">
                        (Cần thêm {100 - text.length} ký tự để API chấp nhận)
                      </span>
                    )}
                  </div>
                  {activeTab === 'Hội Thoại' && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Dùng định dạng "[Tên Giọng]: văn bản"
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-700/30 mt-4">
                  <div className="text-xs font-bold text-slate-500">
                    Tổng số {text.split(/\s+/).filter(Boolean).length} từ, {text.length} ký tự
                  </div>
                  
                  {activeTab === 'Hội Thoại' && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="splitType" 
                            checked={splitType === 'line1'} 
                            onChange={() => setSplitType('line1')}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${splitType === 'line1' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 group-hover:border-slate-500'}`}>
                            {splitType === 'line1' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className={`text-xs font-bold transition-colors ${splitType === 'line1' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>Chia theo 1 dòng mới</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="splitType" 
                            checked={splitType === 'line2'} 
                            onChange={() => setSplitType('line2')}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${splitType === 'line2' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 group-hover:border-slate-500'}`}>
                            {splitType === 'line2' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className={`text-xs font-bold transition-colors ${splitType === 'line2' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>Chia theo 2 dòng mới</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="splitType" 
                            checked={splitType === 'prefix'} 
                            onChange={() => setSplitType('prefix')}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${splitType === 'prefix' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 group-hover:border-slate-500'}`}>
                            {splitType === 'prefix' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className={`text-xs font-bold transition-colors ${splitType === 'prefix' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>Tự động nhận diện hội thoại</span>
                        </label>
                      </div>
                      <button 
                        onClick={handleSplit}
                        disabled={!text.trim()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          !text.trim() 
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Edit2 size={14} />
                        <span>Chia đoạn</span>
                      </button>
                    </div>
                  )}

                  <button 
                    disabled={!text.trim() || isGenerating}
                    onClick={handleGenerate}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                      !text.trim() || isGenerating 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                    }`}
                  >
                    {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    <span>Chuyển đổi</span>
                  </button>
                </div>
              </>
            )}

            {audioUrl && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-20 left-6 right-6 bg-[#0f111a] p-4 rounded-2xl border border-blue-500/30 flex flex-col gap-4 shadow-2xl z-10"
              >
                <div className="flex items-center gap-4">
                  <audio controls src={audioUrl} className="flex-1 h-10 invert brightness-200" />
                  <button 
                    onClick={() => downloadCharacterAudio(null)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                    title="Tải xuống bản gộp"
                  >
                    <Download size={20} />
                  </button>
                </div>
                
                {segments.length > 0 && (
                  <div className="space-y-2 border-t border-slate-800 pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Tải theo nhân vật (giữ khoảng lặng)</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(segments.map(s => s.characterName).filter(Boolean))).map((name) => (
                        <button
                          key={name as string}
                          onClick={() => downloadCharacterAudio(name as string)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition-all"
                        >
                          <User size={12} />
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Config */}
        <div className="w-80 h-full overflow-y-auto pr-1 space-y-4 shrink-0 custom-scrollbar">
          <div className="bg-[#1a1c2e] p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-6">
            {activeTab !== 'Hội Thoại' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-300">Giọng nói</div>
                  <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {voices.find(v => v.id === selectedVoice)?.type === 'clone' || voices.find(v => v.id === selectedVoice)?.tags?.includes('clone') ? 'Nhân bản' : 'Hệ thống'}
                  </div>
                </div>
                
                {selectedModel !== 'lingual_speech_v1' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setVoiceModalTab('available');
                        setIsVoiceModalOpen(true);
                      }}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        !(voices.find(v => v.id === selectedVoice)?.type === 'clone' || voices.find(v => v.id === selectedVoice)?.tags?.includes('clone'))
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Hệ thống
                    </button>
                    <button 
                      onClick={() => {
                        setVoiceModalTab('cloned');
                        setIsVoiceModalOpen(true);
                      }}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        (voices.find(v => v.id === selectedVoice)?.type === 'clone' || voices.find(v => v.id === selectedVoice)?.tags?.includes('clone'))
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Nhân bản
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full py-3 bg-[#0f111a] border border-slate-700/50 hover:border-blue-500/50 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-between px-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      (voices.find(v => v.id === selectedVoice)?.type === 'clone' || voices.find(v => v.id === selectedVoice)?.tags?.includes('clone'))
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      <Mic size={16} />
                    </div>
                    <span className="truncate max-w-[120px]">{voices.find(v => v.id === selectedVoice)?.name || 'Chọn giọng nói'}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-bold text-slate-300">Chọn mô hình</div>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-[#0f111a] border border-slate-700/50 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                  value={selectedModel}
                  onChange={(e) => {
                    const modelId = e.target.value;
                    setSelectedModel(modelId);
                    if (modelId === 'lingual_speech_v1') {
                      setVoiceModalTab('cloned');
                      // If current voice is not a clone, switch to the first available clone
                      const isClone = (v: any) => v.type === 'clone' || (v.tags && v.tags.includes('clone')) || v.userId !== null;
                      const currentVoice = voices.find(v => v.id === selectedVoice);
                      if (currentVoice && !isClone(currentVoice)) {
                        const firstClone = voices.find(isClone);
                        if (firstClone) setSelectedVoice(firstClone.id);
                      }
                    }
                  }}
                >
                  {apiModels.length > 0 ? (
                    apiModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  ) : (
                    MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-600/20">
                <p className="text-xs text-blue-400 leading-relaxed font-medium">
                  Mô hình giúp bạn nhân bản 10 ngôn ngữ. Hỗ trợ tốt cho tiếng Việt, tiếng Anh và tiếng Trung.
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-700/30">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-300">Cấu hình âm thanh</div>
                <button 
                  onClick={() => {
                    setSpeed(1.0);
                    setVolume(1.0);
                    setPitch(1.0);
                    setCommaDur(0.3);
                    setDotDur(0.5);
                    setExclamDur(0.6);
                    setQuestionDur(0.5);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-slate-500" />
                      <span>Tốc độ</span>
                      <HelpCircle size={12} className="text-orange-400/70" />
                    </div>
                    <span className="text-slate-300 font-mono">{speed.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.5" 
                    step="0.01" 
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Volume2 size={14} className="text-slate-500" />
                      <span>Âm lượng</span>
                      <HelpCircle size={12} className="text-orange-400/70" />
                    </div>
                    <span className="text-slate-300 font-mono">{volume.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.9" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <RotateCcw size={14} className="text-slate-500 rotate-180" />
                      <span>Cao độ</span>
                      <HelpCircle size={12} className="text-orange-400/70" />
                    </div>
                    <span className="text-slate-300 font-mono">{pitch.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.9" 
                    step="0.01" 
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-300">Ngắt nghỉ (VN)</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enableDuration} onChange={(e) => setEnableDuration(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {enableDuration && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Dấu phẩy (,)</span>
                        <span className="text-blue-400">{commaDur}s</span>
                      </div>
                      <input type="range" min="0.1" max="2.0" step="0.05" value={commaDur} onChange={(e) => setCommaDur(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Dấu chấm (.)</span>
                        <span className="text-blue-400">{dotDur}s</span>
                      </div>
                      <input type="range" min="0.1" max="2.0" step="0.05" value={dotDur} onChange={(e) => setDotDur(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Dấu cảm (!)</span>
                        <span className="text-blue-400">{exclamDur}s</span>
                      </div>
                      <input type="range" min="0.1" max="2.0" step="0.05" value={exclamDur} onChange={(e) => setExclamDur(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Dấu hỏi (?)</span>
                        <span className="text-blue-400">{questionDur}s</span>
                      </div>
                      <input type="range" min="0.1" max="2.0" step="0.05" value={questionDur} onChange={(e) => setQuestionDur(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                <div className="text-sm font-bold text-slate-300">Xuất file SRT</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={exportSrt} onChange={(e) => setExportSrt(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f111a] font-sans text-slate-200 overflow-hidden">
      <Toaster position="top-right" />
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#1a1c2e] border-r border-slate-700/30 flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 mb-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Mic size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase tracking-widest">VOICE VĂN PHÒNG V1.0</span>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === item.name 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && (
                <span className={`ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  activeTab === item.name ? 'bg-white/20 text-white' : item.badge.includes('+') ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/30 space-y-4">
          <div className="bg-[#0f111a] rounded-2xl p-4 space-y-3 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">PRO</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-black text-white">{credits.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Credits khả dụng</div>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Liên hệ hỗ trợ</div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
              <Facebook size={18} className="text-blue-500" />
              <span>Facebook</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
              <MessageCircle size={18} className="text-blue-400" />
              <span>Zalo</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0f111a] border-b border-slate-700/30 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-xl font-bold text-white">{activeTab === 'Chuyển Văn Bản' ? 'Văn bản thành giọng nói' : activeTab === 'Hội Thoại' ? 'Chuyển hội thoại' : activeTab}</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-colors">
              <Zap size={16} />
              <span>Chuyển đổi mới</span>
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showHistory ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              <Clock size={16} />
              <span>Lịch sử</span>
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 relative">
      {/* Voice Selection Modal */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVoiceModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1a1c2e] border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-700/30 bg-[#1a1c2e]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mic size={24} className="text-blue-500" />
                    Chọn giọng nói
                  </h3>
                  <button onClick={() => setIsVoiceModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                {selectedModel !== 'lingual_speech_v1' ? (
                  <div className="flex p-1 bg-[#0f111a] rounded-xl border border-slate-700/50">
                    <button 
                      onClick={() => setVoiceModalTab('available')}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${voiceModalTab === 'available' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Zap size={14} fill={voiceModalTab === 'available' ? "currentColor" : "none"} />
                        Giọng hệ thống
                      </div>
                    </button>
                    <button 
                      onClick={() => setVoiceModalTab('cloned')}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${voiceModalTab === 'cloned' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Mic size={14} fill={voiceModalTab === 'cloned' ? "currentColor" : "none"} />
                        Giọng nhân bản
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                      <Mic size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Chế độ nhân bản</div>
                      <div className="text-[10px] text-emerald-500/70">Chỉ hiển thị các giọng nói bạn đã nhân bản</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
                {voices
                  .filter(v => {
                    const isClone = v.type === 'clone' || (v.tags && v.tags.includes('clone')) || v.userId !== null;
                    if (selectedModel === 'lingual_speech_v1') return isClone;
                    return voiceModalTab === 'cloned' ? isClone : !isClone;
                  })
                  .map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      if (activeSegmentId) {
                        const targetSegment = segments.find(s => s.id === activeSegmentId);
                        if (targetSegment) {
                          const charName = targetSegment.characterName;
                          if (charName) {
                            // Update all segments with the same character name
                            setSegments(segments.map(s => s.characterName === charName ? { ...s, voice: voice.id, audioUrl: undefined } : s));
                          } else {
                            // Update only this segment
                            setSegments(segments.map(s => s.id === activeSegmentId ? { ...s, voice: voice.id, audioUrl: undefined } : s));
                          }
                        }
                        setActiveSegmentId(null);
                      } else {
                        setSelectedVoice(voice.id);
                        // If global voice changes, we should probably clear segments that don't have a specific voice
                        setSegments(segments.map(s => !s.voice ? { ...s, audioUrl: undefined } : s));
                      }
                      setIsVoiceModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group ${
                      (activeSegmentId ? segments.find(s => s.id === activeSegmentId)?.voice === voice.id : selectedVoice === voice.id)
                      ? (voiceModalTab === 'cloned' ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/20')
                      : 'bg-[#0f111a] border-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      (activeSegmentId ? segments.find(s => s.id === activeSegmentId)?.voice === voice.id : selectedVoice === voice.id)
                      ? (voiceModalTab === 'cloned' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white') 
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{voice.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[10px] ${voiceModalTab === 'cloned' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {voice.gender === 'male' ? 'Nam' : 'Nữ'}
                        </span>
                        <span className="truncate">{voice.language || 'Tiếng Việt'}</span>
                      </div>
                    </div>
                    {(activeSegmentId ? segments.find(s => s.id === activeSegmentId)?.voice === voice.id : selectedVoice === voice.id) && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${voiceModalTab === 'cloned' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                        <Zap size={14} fill="currentColor" />
                      </div>
                    )}
                  </button>
                ))}
                {voices.filter(v => {
                  const isClone = v.type === 'clone' || (v.tags && v.tags.includes('clone')) || v.userId !== null;
                  return voiceModalTab === 'cloned' ? isClone : !isClone;
                }).length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-500 text-sm">
                    Không tìm thấy giọng nói nào trong danh mục này.
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-700/30 bg-[#1a1c2e] flex justify-end">
                <button 
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                  Xong
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
              <motion.div 
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="absolute top-6 right-6 bottom-6 w-80 bg-[#1a1c2e] border border-slate-700/50 shadow-2xl rounded-3xl z-50 flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-slate-700/30 flex justify-between items-center bg-[#1a1c2e]">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Clock size={18} />
                    Lịch sử chuyển đổi
                  </h3>
                  <div className="flex items-center gap-2">
                    {history.length > 0 && (
                      <button 
                        onClick={() => {
                          setHistory([]);
                          localStorage.removeItem('maziao_history');
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    )}
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors">
                      <RefreshCw size={18} className="rotate-45" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f111a]">
                  {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-600">
                      <Clock size={48} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Chưa có lịch sử chuyển đổi.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="bg-[#1a1c2e] p-4 rounded-2xl border border-slate-700/50 space-y-3">
                        <div className="text-xs font-bold text-slate-500">{item.date}</div>
                        <div className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{item.text}</div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">{item.voice}</div>
                          <button 
                            onClick={() => setAudioUrl(item.url)}
                            className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1"
                          >
                            <Play size={12} fill="currentColor" />
                            Nghe lại
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-[#1a1c2e] p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Key size={18} />
                    <span>Cấu hình API</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">API Key</label>
                      <input 
                        type="password"
                        placeholder="Nhập API Key"
                        value={apiKey}
                        onChange={(e) => saveApiKey(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f111a] border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">API Base URL</label>
                      <input 
                        type="text"
                        placeholder="/api/proxy/tts"
                        value={apiBaseUrl}
                        onChange={(e) => saveApiBaseUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f111a] border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        disabled={isFetchingInfo}
                        onClick={() => {
                          if (!apiKey) {
                            setError('Vui lòng nhập API Key');
                            return;
                          }
                          fetchApiInfo(apiKey);
                        }}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors flex items-center gap-2"
                      >
                        {isFetchingInfo ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        <span>Cập nhật thông tin API</span>
                      </button>
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                      >
                        Lưu & Đóng
                      </button>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
