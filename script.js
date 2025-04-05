// Particle Animation
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.3})`; // Subtle white particles
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particle animation
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-background';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50; // Adjust number of particles

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    resizeCanvas();
    createParticles();
    animate();
});

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyD10bB1yYfALYjd9wuDa-pRAw4wk032UH0";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Global variables
let conversationHistory = [];
let userProfile = {
    name: '',
    gender: '',
    age: '',
    occupation: ''
};
let currentMode = null;
let sessionId = 'session_' + Date.now();
let isTyping = false;

// DOM Elements
let chatMessages;
let userInput;
let sendButton;
let typingIndicator;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    chatMessages = document.getElementById('chat-messages');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    typingIndicator = document.getElementById('typing-indicator');

    // Add smooth scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        scrollToBottom();
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
        scrollToBottom();
    }

    // Simulate typing effect character by character
    async function typeMessage(text, element) {
        const chars = text.split('');
        let currentText = '';
        
        element.classList.add('typing');
        
        for (const char of chars) {
            const delay = Math.random() * 15 + 5; // Random delay between 5-20ms
            await new Promise(resolve => setTimeout(resolve, delay));
            currentText += char;
            element.textContent = currentText;
            
            // Add subtle scale animation for each character
            element.style.transform = 'scale(1.01)';
            setTimeout(() => element.style.transform = 'scale(1)', 50);
            
            scrollToBottom();
        }
        
        element.classList.remove('typing');
        
        // Add completion animation
        element.style.transform = 'scale(1.02)';
        setTimeout(() => element.style.transform = 'scale(1)', 200);
    }

    // Add message to chat
    async function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (isUser) {
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        } else {
            // Show typing indicator while preparing the message
            showTypingIndicator();
            
            // Add 2 second delay before bot response
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create the message div but don't show content yet
            messageDiv.textContent = '';
            chatMessages.appendChild(messageDiv);
            
            // Hide typing indicator before starting the typing animation
            hideTypingIndicator();
            
            // Type out the message
            await typeMessage(message, messageDiv);
        }
        scrollToBottom();
    }

    // Handle user input
    async function handleUserInput() {
        const message = userInput.value.trim();
        if (!message || isTyping) return;

        // Clear input and disable
        userInput.value = '';
        setInputState(true);
        isTyping = true;

        // Add user message
        await addMessage(message, true);

        try {
            // Check for post-assessment responses
            if (message === '1' && currentMode === 'quiz') {
                await addMessage("Great choice! I'd be happy to explain more about your personality type. Here are some key aspects:\n\n" +
                    "🌟 Your Extroversion: You gain energy from social interactions, making you naturally skilled at networking and building relationships.\n\n" +
                    "🤔 Decision Making: Your intuitive approach combines emotional intelligence with practical thinking.\n\n" +
                    "📋 Organization: Your structured approach helps you maintain efficiency and reliability.\n\n" +
                    "💡 Problem Solving: Your creative thinking style allows you to find innovative solutions.\n\n" +
                    "Would you like to explore any of these aspects in more detail? Just ask!");
                isTyping = false;
                setInputState(false);
                return;
            }
            
            if (message === '2' && currentMode === 'quiz') {
                currentMode = null;
                conversationHistory = [];
                await addMessage("Let's start fresh with a new personality assessment! 🌟\n\n" +
                    "Would you like to:\n" +
                    "1. Take a personality quiz\n" +
                    "2. Ask personality-related questions\n\n" +
                    "Please type 1 or 2 to choose.");
                isTyping = false;
                setInputState(false);
                return;
            }
            
            if (message === '3' && currentMode === 'quiz') {
                await addMessage("Excellent choice! Here's how you can leverage your strengths: 💪\n\n" +
                    "1. Social Energy (Extroversion)\n" +
                    "   • Take leadership roles in group projects\n" +
                    "   • Network and build meaningful connections\n" +
                    "   • Share your enthusiasm to motivate others\n\n" +
                    "2. Intuitive Decision Making\n" +
                    "   • Trust your gut feelings in complex situations\n" +
                    "   • Balance emotion with logic for better choices\n" +
                    "   • Help others see different perspectives\n\n" +
                    "3. Organizational Skills\n" +
                    "   • Create systems that work for you\n" +
                    "   • Share your methods with others\n" +
                    "   • Take on project management roles\n\n" +
                    "4. Creative Problem Solving\n" +
                    "   • Approach challenges from multiple angles\n" +
                    "   • Brainstorm innovative solutions\n" +
                    "   • Collaborate with others to implement ideas\n\n" +
                    "Would you like to explore any of these areas further or start a new assessment? Type 1 for more details or 2 for a new assessment.");
                isTyping = false;
                setInputState(false);
                return;
            }

            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId,
                    mode: currentMode
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update mode if it's the first message
                if (!currentMode && (message === '1' || message === '2')) {
                    currentMode = message === '1' ? 'quiz' : 'qa';
                }

                // Add bot response with typing effect
                await addMessage(data.response);
            } else {
                await addMessage('Sorry, I encountered an error. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            await addMessage('Sorry, I encountered an error. Please try again.');
        } finally {
            isTyping = false;
            setInputState(false);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isTyping) {
            handleUserInput();
        }
    });

    // Enable/disable input and button during typing
    function setInputState(disabled) {
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
        if (!disabled) {
            userInput.focus();
        }
    }

    // Focus input on load
    userInput.focus();

    // Add initial scroll
    scrollToBottom();
});

async function getGeminiResponse(message, mode = null) {
    let prompt = "You are a professional personality psychologist who provides helpful and insightful responses about personality traits and behaviors.";
    
    if (mode === 'quiz') {
        prompt = `You are a professional personality psychologist conducting a personality assessment. 
        Your goal is to understand the user's personality through natural conversation. 
        Ask relevant questions about their experiences, preferences, and behaviors.
        Keep track of their responses to build a comprehensive understanding.
        Maintain a supportive and professional tone.
        If you haven't collected basic information yet (name, age, gender, occupation), ask for it naturally in the conversation.
        Start by introducing yourself and asking for their name in a friendly way.
        
        Previous conversation: ${JSON.stringify(conversationHistory.slice(-4))}
        User's message: ${message}`;
    } else if (mode === 'qa') {
        prompt = `As a personality expert, please answer this question: "${message}". Provide a detailed, helpful, and professional response that helps the user understand their personality better.`;
    }

    try {
        console.log('Sending request to Gemini:', prompt);
        
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received from Gemini:', data);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const content = data.candidates[0].content.parts[0].text.trim();
            conversationHistory.push({
                role: "assistant",
                content: content
            });
            return content;
        } else {
            console.error('Unexpected API response structure:', data);
            throw new Error('Unexpected API response structure');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// Add ripple effect to send button
document.getElementById('send-button').addEventListener('click', function(e) {
    let ripple = document.createElement('div');
    ripple.className = 'ripple';
    this.appendChild(ripple);
    
    let rect = this.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    setTimeout(() => ripple.remove(), 1000);
});

// Add input field animations
userInput.addEventListener('focus', () => {
    document.querySelector('.chat-input').classList.add('focused');
});

userInput.addEventListener('blur', () => {
    document.querySelector('.chat-input').classList.remove('focused');
});

// Add smooth scroll behavior
function scrollToBottom() {
    const messages = document.querySelector('.chat-messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
}

// Add message hover effects
document.querySelector('.chat-messages').addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('message')) {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            if (msg !== e.target) {
                msg.style.opacity = '0.8';
                msg.style.transform = 'scale(0.98)';
            }
        });
    }
});

document.querySelector('.chat-messages').addEventListener('mouseout', () => {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => {
        msg.style.opacity = '1';
        msg.style.transform = 'scale(1)';
    });
});