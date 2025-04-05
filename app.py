from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
from datetime import datetime
import os
import time

app = Flask(__name__, static_folder='.')
CORS(app)

# Store conversations and user profiles
conversations = {}
user_profiles = {}

# Define personality questions
PERSONALITY_QUESTIONS = [
    {
        "id": "name",
        "question": "Hi there! Before we begin, I'd love to know your name. What should I call you?"
    },
    {
        "id": "social",
        "question": "Nice to meet you, {name}! Let's start with something simple:\n\nIn social situations, do you typically:\nA) Feel energized by being around others\nB) Need some quiet time to recharge\n\nJust type A or B to answer."
    },
    {
        "id": "decisions",
        "question": "Thanks for sharing that, {name}! Here's another interesting one:\n\nWhen making important decisions, do you usually:\nA) Follow your heart and trust your feelings\nB) Analyze the facts and think things through\n\nType A or B to continue."
    },
    {
        "id": "planning",
        "question": "Good choice! Now tell me, {name}:\n\nWhen it comes to planning, are you more likely to:\nA) Go with the flow and be spontaneous\nB) Prefer having a structured plan\n\nType A or B based on what feels most like you."
    },
    {
        "id": "problem_solving",
        "question": "We're learning a lot about you! Here's another one:\n\nWhen facing a challenge, do you tend to:\nA) Look for creative and unique solutions\nB) Rely on proven methods that have worked before\n\nShare your preference with A or B."
    },
    {
        "id": "communication",
        "question": "Almost there, {name}! Last question:\n\nIn conversations, do you prefer:\nA) Having deep discussions about abstract ideas\nB) Talking about concrete, practical matters\n\nOne last A or B to finish up!"
    }
]

def generate_personality_analysis(profile):
    # Skip if we don't have the name
    if 'name' not in profile:
        return "I need to know your name first to provide a personalized analysis."

    name = profile['name']
    traits = []
    
    # Social preference
    if profile.get('social') == 'A':
        traits.append("extroverted and energized by social interactions")
    else:
        traits.append("introspective and value your personal space")
    
    # Decision making
    if profile.get('decisions') == 'A':
        traits.append("tend to trust your intuition")
    else:
        traits.append("take a logical approach to decisions")
    
    # Planning style
    if profile.get('planning') == 'A':
        traits.append("adaptable and spontaneous")
    else:
        traits.append("organized and structured")
    
    # Problem solving
    if profile.get('problem_solving') == 'A':
        traits.append("creative and innovative")
    else:
        traits.append("practical and methodical")
    
    # Communication
    if profile.get('communication') == 'A':
        traits.append("drawn to abstract and theoretical discussions")
    else:
        traits.append("focused on concrete and practical conversations")

    # Generate personalized analysis
    analysis = f"""Thank you for completing the personality assessment, {name}! 🌟

Based on our conversation, I've gained some fascinating insights about you. Here's what I've learned:

You appear to be someone who is {traits[0]}. When it comes to making decisions, you {traits[1]}, which suggests you have a good balance between emotion and logic.

In terms of your approach to life, you're {traits[2]}, and when facing challenges, you tend to be {traits[3]}. In conversations, you're typically {traits[4]}.

These traits combine to make you uniquely you, {name}! Would you like to:
1. Ask questions about your personality type
2. Start a new assessment
3. Learn more about how to leverage your strengths

Just type 1, 2, or 3 to continue our conversation!"""
    
    return analysis

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        time.sleep(0.5)  # Add a small delay for more natural feeling
        data = request.json
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        mode = data.get('mode', None)

        if not message:
            return jsonify({
                'response': "I didn't catch that. Could you please try again?",
                'status': 'error'
            }), 400

        # Initialize conversation history and user profile for new sessions
        if session_id not in conversations:
            conversations[session_id] = []
            user_profiles[session_id] = {}

        profile = user_profiles[session_id]

        # Handle initial mode selection
        if not mode:
            if message.lower() in ['1', 'quiz']:
                mode = 'quiz'
                response = PERSONALITY_QUESTIONS[0]['question']
            elif message.lower() in ['2', 'qa']:
                if 'name' not in profile:
                    mode = 'quiz'
                    response = PERSONALITY_QUESTIONS[0]['question']
                else:
                    mode = 'qa'
                    response = f"Hi {profile['name']}! What would you like to know about personality types? You can ask me anything!"
            else:
                response = "Hello! I'm your friendly personality assessment assistant. I'd love to help you understand yourself better. Would you like to:\n\n1. Take a personality quiz\n2. Ask personality-related questions\n\nJust type 1 or 2 to begin!"

        # Handle quiz mode
        elif mode == 'quiz':
            current_question = None
            
            # If we don't have the name yet, the first question is always about the name
            if 'name' not in profile:
                profile['name'] = message.strip()
                current_question = next((q for q in PERSONALITY_QUESTIONS if q['id'] != 'name'), None)
                response = current_question['question'].format(name=profile['name'])
            else:
                # Find the current question
                answered_questions = set(profile.keys())
                current_question = next((q for q in PERSONALITY_QUESTIONS if q['id'] not in answered_questions), None)
                
                if current_question:
                    # Store the answer
                    profile[current_question['id']] = message.upper()
                    
                    # Get next question
                    next_question = next((q for q in PERSONALITY_QUESTIONS if q['id'] not in profile.keys()), None)
                    
                    if next_question:
                        response = next_question['question'].format(name=profile['name'])
                    else:
                        # All questions answered, generate analysis
                        response = generate_personality_analysis(profile)
                else:
                    response = generate_personality_analysis(profile)

        # Handle Q&A mode
        elif mode == 'qa':
            if 'name' not in profile:
                mode = 'quiz'
                response = PERSONALITY_QUESTIONS[0]['question']
            else:
                response = f"Hi {profile['name']}! I'd be happy to discuss personality types with you. What specific aspects would you like to explore?\n\n1. Understanding personality traits\n2. Improving relationships through personality awareness\n3. Career choices and personality\n4. Personal growth strategies\n5. Communication styles\n\nJust type a number or ask your question!"

        # Store the conversation
        conversations[session_id].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        conversations[session_id].append({
            'role': 'assistant',
            'content': response,
            'timestamp': datetime.now().isoformat()
        })

        return jsonify({
            'response': response,
            'status': 'success',
            'mode': mode
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'response': "I apologize, but I'm having trouble processing your request. Could we start over?",
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 