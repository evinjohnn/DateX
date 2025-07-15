// api/controllers/aiController.js
import { groqAI } from "../utils/groqAI.js";
import User from "../models/User.js";
import AIConversation from "../models/AIConversation.js";
import Message from "../models/Message.js";

export const getChatSuggestions = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { limit = 3 } = req.query;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        // Get recent conversation history
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: matchId },
                { sender: matchId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('sender', 'name');

        const conversationHistory = messages.reverse().map(msg => ({
            senderName: msg.sender.name,
            content: msg.content,
            timestamp: msg.createdAt
        }));

        // Generate suggestions
        const suggestions = await groqAI.generateChatSuggestions(
            currentUser,
            matchUser,
            conversationHistory
        );

        // Save AI conversation context
        await AIConversation.findOneAndUpdate(
            { userId: req.user.id, matchId },
            {
                $set: {
                    context: {
                        userProfile: {
                            name: currentUser.name,
                            age: currentUser.age,
                            interests: currentUser.questionnaire?.interests || [],
                            job: currentUser.job,
                            prompts: currentUser.prompts
                        },
                        matchProfile: {
                            name: matchUser.name,
                            age: matchUser.age,
                            interests: matchUser.questionnaire?.interests || [],
                            job: matchUser.job,
                            prompts: matchUser.prompts
                        },
                        conversationHistory: conversationHistory.slice(-10)
                    }
                },
                $push: {
                    suggestions: suggestions.map(suggestion => ({
                        type: suggestion,
                        timestamp: new Date(),
                        used: false
                    }))
                }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            suggestions: suggestions.slice(0, parseInt(limit))
        });
    } catch (error) {
        console.log("Error in getChatSuggestions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getConversationStarters = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { limit = 3 } = req.query;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        // Generate conversation starters
        const starters = await geminiAI.generateConversationStarters(
            currentUser,
            matchUser
        );

        // Save to AI conversation
        await AIConversation.findOneAndUpdate(
            { userId: req.user.id, matchId },
            {
                $push: {
                    conversationStarters: starters.map(starter => ({
                        ...starter,
                        timestamp: new Date()
                    }))
                }
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            starters: starters.slice(0, parseInt(limit))
        });
    } catch (error) {
        console.log("Error in getConversationStarters:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const analyzeMood = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const currentUser = await User.findById(req.user.id);
        const matchUser = await User.findById(matchId);
        
        if (!matchUser) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        // Get recent messages
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: matchId },
                { sender: matchId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('sender', 'name');

        const conversationHistory = messages.reverse().map(msg => ({
            senderName: msg.sender.name,
            content: msg.content,
            timestamp: msg.createdAt
        }));

        // Analyze mood
        const moodAnalysis = await geminiAI.analyzeMood(conversationHistory);

        // Update AI conversation with mood analysis
        await AIConversation.findOneAndUpdate(
            { userId: req.user.id, matchId },
            {
                $set: {
                    moodAnalysis: {
                        ...moodAnalysis,
                        lastAnalyzed: new Date()
                    }
                }
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            moodAnalysis
        });
    } catch (error) {
        console.log("Error in analyzeMood:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const markSuggestionUsed = async (req, res) => {
    try {
        const { matchId, suggestionId } = req.params;
        const { effectiveness } = req.body;
        
        await AIConversation.findOneAndUpdate(
            { 
                userId: req.user.id, 
                matchId,
                'suggestions._id': suggestionId
            },
            {
                $set: {
                    'suggestions.$.used': true,
                    'suggestions.$.effectiveness': effectiveness || 0
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Suggestion marked as used"
        });
    } catch (error) {
        console.log("Error in markSuggestionUsed:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAIInsights = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const aiConversation = await AIConversation.findOne({
            userId: req.user.id,
            matchId
        });

        if (!aiConversation) {
            return res.status(404).json({ success: false, message: "No AI insights available" });
        }

        const insights = {
            conversationStage: aiConversation.context?.conversationStage || 'opening',
            moodAnalysis: aiConversation.moodAnalysis,
            suggestionEffectiveness: aiConversation.suggestions
                .filter(s => s.used)
                .map(s => ({
                    suggestion: s.type,
                    effectiveness: s.effectiveness
                })),
            recommendedApproach: aiConversation.moodAnalysis?.suggestedApproach || 'Be genuine and ask engaging questions'
        };

        res.status(200).json({
            success: true,
            insights
        });
    } catch (error) {
        console.log("Error in getAIInsights:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateAISettings = async (req, res) => {
    try {
        const { aiAssistantEnabled, aiPersonality } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                aiAssistantEnabled,
                aiPersonality
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user,
            message: "AI settings updated successfully"
        });
    } catch (error) {
        console.log("Error in updateAISettings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};