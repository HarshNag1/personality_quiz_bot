document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startButton = document.getElementById('startVoice');
    const stopButton = document.getElementById('stopVoice');
    const currentSpeech = document.getElementById('current-speech');
    const transcript = document.getElementById('transcript');
    const audioWave = document.querySelector('.audio-wave');
    const statusText = document.querySelector('.status-text');
    const modelContainer = document.querySelector('.model-container');
    const mouthAnimation = document.querySelector('.mouth-animation');
    const modelImage = document.querySelector('.model-image');

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    // Speech Synthesis Setup
    const synth = window.speechSynthesis;
    let speaking = false;
    let isListening = false;
    let currentVoice = null;

    // Personality Quiz Data
    const personalityQuestions = [
        "How do you prefer to spend your free time?",
        "When faced with a difficult decision, what's your first instinct?",
        "How do you recharge your energy?",
        "What's your ideal work environment?",
        "How do you handle stress?",
        "What's your communication style?",
        "How do you approach new challenges?",
        "What motivates you the most?",
        "How do you prefer to learn new things?",
        "What's your ideal weekend activity?"
    ];

    const personalityTraits = {
        introvert: 0,
        extrovert: 0,
        analytical: 0,
        creative: 0,
        structured: 0,
        flexible: 0,
        logical: 0,
        emotional: 0
    };

    let currentQuestionIndex = -1;
    let quizStarted = false;
    let quizCompleted = false;

    // Event Listeners
    startButton.addEventListener('click', startListening);
    stopButton.addEventListener('click', stopListening);

    // Add hover effect to model
    modelContainer.addEventListener('mousemove', (e) => {
        const rect = modelContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        modelContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    modelContainer.addEventListener('mouseleave', () => {
        modelContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });

    recognition.addEventListener('start', () => {
        isListening = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        audioWave.style.display = 'flex';
        statusText.textContent = 'Listening...';
        
        // Animate the audio wave
        animateAudioWave();
    });

    recognition.addEventListener('end', () => {
        isListening = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        audioWave.style.display = 'none';
        statusText.textContent = 'Click "Start Speaking" to begin the conversation';
    });

    recognition.addEventListener('result', (event) => {
        const userText = event.results[0][0].transcript;
        addMessageToTranscript('user', userText);
        processUserInput(userText);
    });

    recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        statusText.textContent = `Error: ${event.error}. Please try again.`;
        stopListening();
    });

    // Functions
    function startListening() {
        try {
            recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            statusText.textContent = 'Error starting speech recognition. Please try again.';
        }
    }

    function stopListening() {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }

    function addMessageToTranscript(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'assistant-message';
        messageDiv.textContent = text;
        transcript.appendChild(messageDiv);
        transcript.scrollTop = transcript.scrollHeight;
        
        // Add typing animation for assistant messages
        if (sender === 'assistant') {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.style.opacity = '1';
            }, 100);
        }
    }

    function speak(text) {
        return new Promise((resolve) => {
            // Cancel any ongoing speech
            synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to use a female voice if available
            if (!currentVoice) {
                const voices = synth.getVoices();
                const femaleVoice = voices.find(voice => 
                    voice.name.includes('female') || 
                    voice.name.includes('Female') || 
                    voice.name.includes('Samantha') || 
                    voice.name.includes('Google US English Female')
                );
                
                if (femaleVoice) {
                    currentVoice = femaleVoice;
                }
            }
            
            if (currentVoice) {
                utterance.voice = currentVoice;
            }
            
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                speaking = true;
                modelContainer.classList.add('speaking');
                currentSpeech.textContent = text;
                animateMouth();
            };

            utterance.onend = () => {
                speaking = false;
                modelContainer.classList.remove('speaking');
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                speaking = false;
                modelContainer.classList.remove('speaking');
                resolve();
            };

            synth.speak(utterance);
        });
    }

    function animateMouth() {
        if (speaking) {
            const randomHeight = Math.random() * 5 + 2;
            mouthAnimation.style.height = `${randomHeight}px`;
            requestAnimationFrame(animateMouth);
        }
    }

    function animateAudioWave() {
        if (isListening) {
            const spans = audioWave.querySelectorAll('span');
            spans.forEach((span, index) => {
                const height = Math.random() * 30 + 10;
                span.style.height = `${height}px`;
            });
            requestAnimationFrame(animateAudioWave);
        }
    }

    async function processUserInput(text) {
        const lowerText = text.toLowerCase();
        let response = '';
        
        // Check if this is a quiz-related query
        if (lowerText.includes('quiz') || lowerText.includes('test') || lowerText.includes('personality')) {
            if (!quizStarted) {
                quizStarted = true;
                currentQuestionIndex = 0;
                response = "Great! Let's start the personality quiz. " + personalityQuestions[currentQuestionIndex];
            } else if (quizCompleted) {
                response = "You've already completed the quiz. Would you like to see your results or start a new quiz?";
            } else {
                // Process the answer to the current question
                processAnswer(lowerText);
                
                // Move to the next question or complete the quiz
                currentQuestionIndex++;
                if (currentQuestionIndex < personalityQuestions.length) {
                    response = personalityQuestions[currentQuestionIndex];
                } else {
                    quizCompleted = true;
                    const results = analyzePersonalityResults();
                    response = `Quiz completed! Based on your answers, you are: ${results}. Would you like to see a detailed breakdown of your personality traits?`;
                }
            }
        } 
        // Handle results request
        else if (lowerText.includes('result') || lowerText.includes('see my') || lowerText.includes('breakdown')) {
            if (quizCompleted) {
                const results = analyzePersonalityResults();
                response = `Your personality profile: ${results}. You show strong tendencies toward: ${getDetailedTraits()}. Would you like to start a new quiz or learn more about your personality type?`;
            } else if (quizStarted) {
                response = "You haven't completed the quiz yet. Let's continue with the questions.";
            } else {
                response = "You haven't taken the personality quiz yet. Would you like to start now?";
            }
        }
        // Handle greetings
        else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
            response = "Hello! I'm here to help you with the personality quiz. Would you like to start the quiz or learn more about it?";
        } 
        // Handle help requests
        else if (lowerText.includes('help') || lowerText.includes('how') || lowerText.includes('what')) {
            response = "I can help you with the personality quiz, explain the results, or answer any questions you have. What would you like to know?";
        } 
        // Handle thank you
        else if (lowerText.includes('thank')) {
            response = "You're welcome! Is there anything else you'd like to know about your personality or the quiz?";
        } 
        // Handle quiz restart
        else if (lowerText.includes('start') || lowerText.includes('new') || lowerText.includes('again')) {
            quizStarted = true;
            quizCompleted = false;
            currentQuestionIndex = 0;
            resetPersonalityTraits();
            response = "Let's start a new personality quiz. " + personalityQuestions[currentQuestionIndex];
        }
        // Default response
        else {
            response = "I understand you're interested in learning more. Would you like to take the personality quiz to discover your traits?";
        }

        addMessageToTranscript('assistant', response);
        await speak(response);
    }

    function processAnswer(answer) {
        // Simple keyword-based analysis
        if (answer.includes('alone') || answer.includes('quiet') || answer.includes('reading')) {
            personalityTraits.introvert += 1;
        } else if (answer.includes('people') || answer.includes('social') || answer.includes('friends')) {
            personalityTraits.extrovert += 1;
        }
        
        if (answer.includes('think') || answer.includes('analyze') || answer.includes('logic')) {
            personalityTraits.analytical += 1;
        } else if (answer.includes('feel') || answer.includes('emotion') || answer.includes('heart')) {
            personalityTraits.emotional += 1;
        }
        
        if (answer.includes('plan') || answer.includes('structure') || answer.includes('organize')) {
            personalityTraits.structured += 1;
        } else if (answer.includes('spontaneous') || answer.includes('flexible') || answer.includes('adapt')) {
            personalityTraits.flexible += 1;
        }
        
        if (answer.includes('creative') || answer.includes('imagine') || answer.includes('art')) {
            personalityTraits.creative += 1;
        } else if (answer.includes('logic') || answer.includes('reason') || answer.includes('facts')) {
            personalityTraits.logical += 1;
        }
    }

    function analyzePersonalityResults() {
        const traits = [];
        
        if (personalityTraits.introvert > personalityTraits.extrovert) {
            traits.push("Introverted");
        } else {
            traits.push("Extroverted");
        }
        
        if (personalityTraits.analytical > personalityTraits.emotional) {
            traits.push("Analytical");
        } else {
            traits.push("Emotional");
        }
        
        if (personalityTraits.structured > personalityTraits.flexible) {
            traits.push("Structured");
        } else {
            traits.push("Flexible");
        }
        
        if (personalityTraits.creative > personalityTraits.logical) {
            traits.push("Creative");
        } else {
            traits.push("Logical");
        }
        
        return traits.join(", ");
    }

    function getDetailedTraits() {
        const traitDescriptions = [];
        
        if (personalityTraits.introvert > personalityTraits.extrovert) {
            traitDescriptions.push("introversion (you recharge by spending time alone)");
        } else {
            traitDescriptions.push("extroversion (you gain energy from social interactions)");
        }
        
        if (personalityTraits.analytical > personalityTraits.emotional) {
            traitDescriptions.push("analytical thinking (you prefer to analyze situations logically)");
        } else {
            traitDescriptions.push("emotional intelligence (you're in tune with feelings and emotions)");
        }
        
        if (personalityTraits.structured > personalityTraits.flexible) {
            traitDescriptions.push("structured approach (you prefer planning and organization)");
        } else {
            traitDescriptions.push("flexibility (you adapt well to changing situations)");
        }
        
        if (personalityTraits.creative > personalityTraits.logical) {
            traitDescriptions.push("creativity (you think outside the box and generate new ideas)");
        } else {
            traitDescriptions.push("logical reasoning (you excel at problem-solving and critical thinking)");
        }
        
        return traitDescriptions.join(", ");
    }

    function resetPersonalityTraits() {
        for (const trait in personalityTraits) {
            personalityTraits[trait] = 0;
        }
    }

    // Initialize with welcome message
    const welcomeMessage = "Hello! I'm your professional virtual assistant. I can help you with the personality quiz. Would you like to start the quiz or learn more about it?";
    speak(welcomeMessage);
    
    // Load voices for speech synthesis
    if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', () => {
            const voices = synth.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.name.includes('female') || 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Google US English Female')
            );
            
            if (femaleVoice) {
                currentVoice = femaleVoice;
            }
        });
    } else {
        const voices = synth.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha') || 
            voice.name.includes('Google US English Female')
        );
        
        if (femaleVoice) {
            currentVoice = femaleVoice;
        }
    }
}); 