// client/src/store/usePromptsStore.js
import { create } from "zustand";

export const usePromptsStore = create((set, get) => ({
    promptCategories: {
        conversation: {
            title: "Conversation Starters",
            description: "Break the ice with these fun questions",
            color: "from-blue-500 to-cyan-500",
            prompts: [
                {
                    id: 1,
                    text: "What's your go-to karaoke song?",
                    difficulty: "easy",
                    category: "conversation"
                },
                {
                    id: 2,
                    text: "What's the most spontaneous thing you've ever done?",
                    difficulty: "medium",
                    category: "conversation"
                },
                {
                    id: 3,
                    text: "If you could have dinner with anyone, dead or alive, who would it be?",
                    difficulty: "easy",
                    category: "conversation"
                },
                {
                    id: 4,
                    text: "What's your most unpopular opinion?",
                    difficulty: "hard",
                    category: "conversation"
                },
                {
                    id: 5,
                    text: "What's the weirdest food combination you actually love?",
                    difficulty: "easy",
                    category: "conversation"
                },
                {
                    id: 6,
                    text: "What's a skill you wish you had?",
                    difficulty: "medium",
                    category: "conversation"
                },
                {
                    id: 7,
                    text: "What's your spirit animal and why?",
                    difficulty: "easy",
                    category: "conversation"
                },
                {
                    id: 8,
                    text: "What's the last thing that made you laugh out loud?",
                    difficulty: "easy",
                    category: "conversation"
                },
                {
                    id: 9,
                    text: "What's your biggest pet peeve?",
                    difficulty: "medium",
                    category: "conversation"
                },
                {
                    id: 10,
                    text: "What's something you're embarrassingly bad at?",
                    difficulty: "medium",
                    category: "conversation"
                }
            ]
        },
        deep: {
            title: "Deep Connection",
            description: "Get to know each other on a deeper level",
            color: "from-purple-500 to-pink-500",
            prompts: [
                {
                    id: 11,
                    text: "What's the most important lesson life has taught you?",
                    difficulty: "hard",
                    category: "deep"
                },
                {
                    id: 12,
                    text: "What does your perfect day look like?",
                    difficulty: "medium",
                    category: "deep"
                },
                {
                    id: 13,
                    text: "What's something you believe that others might disagree with?",
                    difficulty: "hard",
                    category: "deep"
                },
                {
                    id: 14,
                    text: "What's your biggest fear and how do you deal with it?",
                    difficulty: "hard",
                    category: "deep"
                },
                {
                    id: 15,
                    text: "What's something you're passionate about that most people don't know?",
                    difficulty: "medium",
                    category: "deep"
                },
                {
                    id: 16,
                    text: "How do you define success in your life?",
                    difficulty: "hard",
                    category: "deep"
                },
                {
                    id: 17,
                    text: "What's a moment that changed your perspective on life?",
                    difficulty: "hard",
                    category: "deep"
                },
                {
                    id: 18,
                    text: "What's your love language and why?",
                    difficulty: "medium",
                    category: "deep"
                },
                {
                    id: 19,
                    text: "What's something you've always wanted to try but haven't yet?",
                    difficulty: "medium",
                    category: "deep"
                },
                {
                    id: 20,
                    text: "What's your biggest dream and what's stopping you from pursuing it?",
                    difficulty: "hard",
                    category: "deep"
                }
            ]
        },
        lifestyle: {
            title: "Lifestyle & Interests",
            description: "Share your hobbies, interests, and daily life",
            color: "from-green-500 to-teal-500",
            prompts: [
                {
                    id: 21,
                    text: "What's your favorite way to spend a Sunday morning?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 22,
                    text: "Are you more of a morning person or night owl?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 23,
                    text: "What's the last book you read that you couldn't put down?",
                    difficulty: "medium",
                    category: "lifestyle"
                },
                {
                    id: 24,
                    text: "What's your favorite local spot that tourists don't know about?",
                    difficulty: "medium",
                    category: "lifestyle"
                },
                {
                    id: 25,
                    text: "What's something you're learning right now?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 26,
                    text: "What's your go-to comfort food?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 27,
                    text: "How do you like to stay active?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 28,
                    text: "What's your ideal vacation destination?",
                    difficulty: "easy",
                    category: "lifestyle"
                },
                {
                    id: 29,
                    text: "What's a hobby you've picked up recently?",
                    difficulty: "medium",
                    category: "lifestyle"
                },
                {
                    id: 30,
                    text: "What's your favorite type of music to listen to while working?",
                    difficulty: "easy",
                    category: "lifestyle"
                }
            ]
        }
    },
    selectedCategory: "conversation",
    currentPromptIndex: 0,
    usedPrompts: [],
    
    // Set selected category
    setSelectedCategory: (category) => set({ selectedCategory: category, currentPromptIndex: 0 }),
    
    // Get current prompt
    getCurrentPrompt: () => {
        const { promptCategories, selectedCategory, currentPromptIndex } = get();
        const prompts = promptCategories[selectedCategory]?.prompts || [];
        return prompts[currentPromptIndex] || null;
    },
    
    // Get prompts by category
    getPromptsByCategory: (category) => {
        const { promptCategories } = get();
        return promptCategories[category]?.prompts || [];
    },
    
    // Get filtered prompts by difficulty
    getPromptsByDifficulty: (category, difficulty) => {
        const { promptCategories } = get();
        const prompts = promptCategories[category]?.prompts || [];
        return prompts.filter(prompt => prompt.difficulty === difficulty);
    },
    
    // Navigate to next prompt
    nextPrompt: () => {
        const { promptCategories, selectedCategory, currentPromptIndex } = get();
        const prompts = promptCategories[selectedCategory]?.prompts || [];
        const nextIndex = (currentPromptIndex + 1) % prompts.length;
        set({ currentPromptIndex: nextIndex });
    },
    
    // Navigate to previous prompt
    previousPrompt: () => {
        const { promptCategories, selectedCategory, currentPromptIndex } = get();
        const prompts = promptCategories[selectedCategory]?.prompts || [];
        const prevIndex = currentPromptIndex === 0 ? prompts.length - 1 : currentPromptIndex - 1;
        set({ currentPromptIndex: prevIndex });
    },
    
    // Mark prompt as used
    usePrompt: (promptId) => {
        set(state => ({
            usedPrompts: [...state.usedPrompts, promptId]
        }));
    },
    
    // Get random prompt from category
    getRandomPrompt: (category) => {
        const { promptCategories } = get();
        const prompts = promptCategories[category]?.prompts || [];
        if (prompts.length === 0) return null;
        return prompts[Math.floor(Math.random() * prompts.length)];
    },
    
    // Get unused prompts
    getUnusedPrompts: (category) => {
        const { promptCategories, usedPrompts } = get();
        const prompts = promptCategories[category]?.prompts || [];
        return prompts.filter(prompt => !usedPrompts.includes(prompt.id));
    },
    
    // Reset used prompts
    resetUsedPrompts: () => set({ usedPrompts: [] }),
    
    // Get category info
    getCategoryInfo: (category) => {
        const { promptCategories } = get();
        return promptCategories[category] || null;
    }
}));