// api/utils/groqAI.js
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export class GroqAIService {
    constructor() {
        this.model = "llama3-70b-8192";
    }

    async generateChatSuggestions(userProfile, matchProfile, conversationHistory = []) {
        try {
            const prompt = this.buildChatSuggestionsPrompt(userProfile, matchProfile, conversationHistory);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0.7,
                max_tokens: 500,
            });
            
            const text = completion.choices[0].message.content;
            return this.parseChatSuggestions(text);
        } catch (error) {
            console.error('Error generating chat suggestions:', error);
            return this.getDefaultSuggestions(matchProfile);
        }
    }

    async generateConversationStarters(userProfile, matchProfile) {
        try {
            const prompt = this.buildConversationStartersPrompt(userProfile, matchProfile);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0.8,
                max_tokens: 400,
            });
            
            const text = completion.choices[0].message.content;
            return this.parseConversationStarters(text);
        } catch (error) {
            console.error('Error generating conversation starters:', error);
            return this.getDefaultConversationStarters(matchProfile);
        }
    }

    async analyzeMood(messages) {
        try {
            const prompt = this.buildMoodAnalysisPrompt(messages);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0.3,
                max_tokens: 300,
            });
            
            const text = completion.choices[0].message.content;
            return this.parseMoodAnalysis(text);
        } catch (error) {
            console.error('Error analyzing mood:', error);
            return {
                currentMood: 'neutral',
                confidence: 0.5,
                suggestedApproach: 'friendly and casual'
            };
        }
    }

    async generateIceBreaker(userProfile, matchProfile, likedContent) {
        try {
            const prompt = this.buildIceBreakerPrompt(userProfile, matchProfile, likedContent);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0.7,
                max_tokens: 200,
            });
            
            const text = completion.choices[0].message.content;
            return this.parseIceBreaker(text);
        } catch (error) {
            console.error('Error generating ice breaker:', error);
            return `Hey ${matchProfile.name}! I loved your ${likedContent}. What's the story behind it?`;
        }
    }

    buildChatSuggestionsPrompt(userProfile, matchProfile, conversationHistory) {
        return `You are an AI dating coach helping ${userProfile.name} chat with ${matchProfile.name}. 

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Interests: ${userProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
- Job: ${userProfile.job || 'Not specified'}
- Prompts: ${userProfile.prompts?.map(p => `${p.prompt}: ${p.answer}`).join('; ') || 'None'}

MATCH PROFILE:
- Name: ${matchProfile.name}
- Age: ${matchProfile.age}
- Interests: ${matchProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
- Job: ${matchProfile.job || 'Not specified'}
- Prompts: ${matchProfile.prompts?.map(p => `${p.prompt}: ${p.answer}`).join('; ') || 'None'}

CONVERSATION HISTORY:
${conversationHistory.slice(-10).map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

Generate 3 personalized, engaging response suggestions that:
1. Show genuine interest in ${matchProfile.name}
2. Reference their profile or previous messages
3. Ask engaging questions
4. Keep the conversation flowing naturally
5. Match the tone of previous messages

Format as JSON array of strings.`;
    }

    buildConversationStartersPrompt(userProfile, matchProfile) {
        return `Generate 3 engaging conversation starters for ${userProfile.name} to message ${matchProfile.name}.

MATCH PROFILE:
- Name: ${matchProfile.name}
- Age: ${matchProfile.age}
- Job: ${matchProfile.job || 'Not specified'}
- School: ${matchProfile.school || 'Not specified'}
- Interests: ${matchProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
- Prompts: ${matchProfile.prompts?.map(p => `${p.prompt}: ${p.answer}`).join('; ') || 'None'}

Create conversation starters that:
1. Reference specific details from their profile
2. Ask engaging questions
3. Show genuine interest
4. Are not generic or boring
5. Have a friendly, approachable tone

Format as JSON array of objects with 'message' and 'basedOn' fields.`;
    }

    buildMoodAnalysisPrompt(messages) {
        return `Analyze the mood and tone of this conversation:

MESSAGES:
${messages.slice(-10).map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

Determine:
1. Current mood (excited, friendly, flirty, serious, sad, confused, playful, etc.)
2. Confidence level (0-1)
3. Suggested approach for responding

Format as JSON object with 'currentMood', 'confidence', and 'suggestedApproach' fields.`;
    }

    buildIceBreakerPrompt(userProfile, matchProfile, likedContent) {
        return `Create a personalized ice breaker message for ${userProfile.name} to send to ${matchProfile.name}.

Context: ${userProfile.name} just liked "${likedContent}" on ${matchProfile.name}'s profile.

MATCH PROFILE:
- Name: ${matchProfile.name}
- Age: ${matchProfile.age}
- Job: ${matchProfile.job || 'Not specified'}
- Interests: ${matchProfile.questionnaire?.interests?.join(', ') || 'Not specified'}

Create a message that:
1. References what they liked
2. Asks an engaging question
3. Shows genuine interest
4. Is casual and friendly
5. Is unique and not generic

Return just the message text.`;
    }

    parseChatSuggestions(text) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed.slice(0, 3);
            }
        } catch (e) {
            // If not valid JSON, try to extract suggestions from text
            const lines = text.split('\n').filter(line => line.trim());
            const suggestions = lines
                .filter(line => line.includes('.') || line.includes('?') || line.includes('!'))
                .map(line => line.replace(/^\d+\.?\s*/, '').trim())
                .filter(line => line.length > 10)
                .slice(0, 3);
            
            return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions();
        }
        
        return this.getDefaultSuggestions();
    }

    parseConversationStarters(text) {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed.slice(0, 3);
            }
        } catch (e) {
            // Extract from text format
            const lines = text.split('\n').filter(line => line.trim());
            const starters = lines
                .filter(line => line.includes('?') || line.includes('!'))
                .map(line => ({
                    message: line.replace(/^\d+\.?\s*/, '').trim(),
                    basedOn: 'profile'
                }))
                .slice(0, 3);
                
            return starters.length > 0 ? starters : this.getDefaultConversationStarters();
        }
        
        return this.getDefaultConversationStarters();
    }

    parseMoodAnalysis(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            // Extract mood from text
            const mood = text.toLowerCase().includes('excited') ? 'excited' :
                        text.toLowerCase().includes('flirty') ? 'flirty' :
                        text.toLowerCase().includes('serious') ? 'serious' :
                        text.toLowerCase().includes('playful') ? 'playful' :
                        'friendly';
            
            return {
                currentMood: mood,
                confidence: 0.7,
                suggestedApproach: 'match their energy and tone'
            };
        }
    }

    parseIceBreaker(text) {
        // Clean up the response
        return text.replace(/^["']|["']$/g, '').trim();
    }

    getDefaultSuggestions(matchProfile = {}) {
        return [
            `That's really interesting! Tell me more about that.`,
            `I'd love to hear more about your thoughts on this.`,
            `What's been the highlight of your week so far?`
        ];
    }

    getDefaultConversationStarters(matchProfile = {}) {
        return [
            {
                message: `Hey ${matchProfile.name}! I noticed we might have some common interests. What's something you're passionate about lately?`,
                basedOn: 'profile'
            },
            {
                message: `Hi there! Your profile caught my attention. What's the best part of your day usually?`,
                basedOn: 'general'
            },
            {
                message: `Hey! I'm curious - what's something you've been looking forward to recently?`,
                basedOn: 'general'
            }
        ];
    }
}

export const groqAI = new GroqAIService();