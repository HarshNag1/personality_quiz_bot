class LipSyncAnalyzer {
    constructor(modelViewer) {
        this.modelViewer = modelViewer;
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.speechQueue = [];
        this.currentSpeech = null;
        this.audioContext = null;
        this.analyser = null;
        this.audioData = null;

        // Map phonemes to visemes
        this.phonemeMap = {
            'AA': 'A', 'AE': 'A', 'AH': 'A', 'AO': 'A', 'AW': 'A', 'AY': 'A',
            'B': 'B', 'CH': 'C', 'D': 'C', 'DH': 'C',
            'EH': 'D', 'ER': 'D', 'EY': 'D',
            'F': 'E', 'V': 'E',
            'IH': 'F', 'IY': 'F',
            'G': 'G', 'HH': 'H', 'JH': 'C',
            'K': 'G', 'L': 'H', 'M': 'B', 'N': 'C',
            'NG': 'G', 'OW': 'A', 'OY': 'A',
            'P': 'B', 'R': 'H', 'S': 'C', 'SH': 'C',
            'T': 'C', 'TH': 'C', 'UH': 'A', 'UW': 'A',
            'W': 'A', 'Y': 'F', 'Z': 'C', 'ZH': 'C'
        };
    }

    startListening() {
        if (this.isListening) return;
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript;
                this.processSpeech(transcript);
                this.addToTranscript('user', transcript);
            }
        };

        this.recognition.onstart = () => {
            this.isListening = true;
            document.querySelector('.audio-wave').style.display = 'flex';
            document.querySelector('.status-text').textContent = 'Listening...';
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.recognition.start();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.start();
    }

    stopListening() {
        if (!this.isListening) return;
        
        this.isListening = false;
        this.recognition.stop();
        
        document.querySelector('.audio-wave').style.display = 'none';
        document.querySelector('.status-text').textContent = 'Click "Start Speaking" to begin the conversation';
    }

    processSpeech(text) {
        const words = text.toLowerCase().split(' ');
        for (const word of words) {
            for (let i = 0; i < word.length; i++) {
                const phoneme = this.getPhonemeForChar(word[i]);
                const viseme = this.phonemeMap[phoneme] || 'A';
                this.modelViewer.updateMorphTargets(viseme);
                
                // Add a small delay between visemes
                setTimeout(() => {
                    this.modelViewer.updateMorphTargets('A'); // Reset to neutral
                }, 100);
            }
        }
    }

    getPhonemeForChar(char) {
        // Simple mapping of characters to phonemes
        const charToPhoneme = {
            'a': 'AA', 'e': 'EH', 'i': 'IY', 'o': 'OW', 'u': 'UW',
            'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
            'h': 'HH', 'j': 'JH', 'k': 'K', 'l': 'L', 'm': 'M',
            'n': 'N', 'p': 'P', 'q': 'K', 'r': 'R', 's': 'S',
            't': 'T', 'v': 'V', 'w': 'W', 'x': 'K', 'y': 'Y', 'z': 'Z'
        };
        return charToPhoneme[char] || 'AA';
    }

    speak(text) {
        return new Promise((resolve) => {
            this.speechQueue.push({ text, resolve });
            
            if (!this.isSpeaking) {
                this.processSpeechQueue();
            }
        });
    }
    
    processSpeechQueue() {
        if (this.speechQueue.length === 0) {
            this.isSpeaking = false;
            return;
        }
        
        this.isSpeaking = true;
        const { text, resolve } = this.speechQueue.shift();
        
        // Update speech bubble
        document.getElementById('current-speech').textContent = text;
        
        // Add to transcript
        this.addToTranscript('assistant', text);
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices and select a female voice
        const voices = this.synthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        // Handle speech events
        utterance.onstart = () => {
            this.processSpeech(text);
        };
        
        utterance.onend = () => {
            this.modelViewer.updateMorphTargets('A'); // Reset to neutral
            resolve();
            this.processSpeechQueue();
        };
        
        // Speak the text
        this.synthesis.speak(utterance);
    }
    
    addToTranscript(sender, text) {
        const transcript = document.getElementById('transcript');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'assistant-message';
        messageDiv.textContent = text;
        transcript.appendChild(messageDiv);
        
        // Scroll to bottom
        transcript.scrollTop = transcript.scrollHeight;
    }
}

export default LipSyncAnalyzer; 