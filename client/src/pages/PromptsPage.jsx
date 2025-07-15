// client/src/pages/PromptsPage.jsx
import { useState } from "react";
import { usePromptsStore } from "../store/usePromptsStore";
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    MessageCircle,
    Heart,
    Coffee,
    Star,
    Filter,
    Shuffle,
    Copy,
    Share
} from "lucide-react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const PromptsPage = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const { authUser } = useAuthStore();
    
    const {
        promptCategories,
        selectedCategory,
        currentPromptIndex,
        setSelectedCategory,
        getCurrentPrompt,
        getPromptsByDifficulty,
        getUnusedPrompts,
        nextPrompt,
        previousPrompt,
        usePrompt,
        getRandomPrompt,
        getCategoryInfo
    } = usePromptsStore();

    const { getChatSuggestions } = useAIStore();

    const currentPrompt = getCurrentPrompt();
    const categoryInfo = getCategoryInfo(selectedCategory);

    const filteredPrompts = selectedDifficulty === "all" 
        ? promptCategories[selectedCategory]?.prompts || []
        : getPromptsByDifficulty(selectedCategory, selectedDifficulty);

    const handleCopyPrompt = (prompt) => {
        navigator.clipboard.writeText(prompt.text);
        toast.success("Prompt copied to clipboard!");
    };

    const handleSharePrompt = (prompt) => {
        if (navigator.share) {
            navigator.share({
                title: "Dating Prompt",
                text: prompt.text,
                url: window.location.href
            });
        } else {
            handleCopyPrompt(prompt);
        }
    };

    const handleUsePrompt = (prompt) => {
        usePrompt(prompt.id);
        toast.success("Prompt marked as used!");
    };

    const handleRandomPrompt = () => {
        const randomPrompt = getRandomPrompt(selectedCategory);
        if (randomPrompt) {
            const currentPrompts = promptCategories[selectedCategory]?.prompts || [];
            const randomIndex = currentPrompts.findIndex(p => p.id === randomPrompt.id);
            if (randomIndex !== -1) {
                // Update current index to the random prompt
                // This would need to be implemented in the store
                toast.success("Random prompt selected!");
            }
        }
    };

    const difficulties = [
        { value: "all", label: "All Levels", color: "gray" },
        { value: "easy", label: "Easy", color: "green" },
        { value: "medium", label: "Medium", color: "yellow" },
        { value: "hard", label: "Hard", color: "red" }
    ];

    const categories = Object.entries(promptCategories).map(([key, category]) => ({
        key,
        ...category
    }));

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-pink-400 mr-3" />
                            <h1 className="text-3xl font-bold text-white">Conversation Prompts</h1>
                        </div>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Discover engaging conversation starters to break the ice and connect with your matches
                        </p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category.key}
                                onClick={() => setSelectedCategory(category.key)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                    selectedCategory === category.key
                                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                            
                            {showFilters && (
                                <div className="flex space-x-2">
                                    {difficulties.map((difficulty) => (
                                        <button
                                            key={difficulty.value}
                                            onClick={() => setSelectedDifficulty(difficulty.value)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                                selectedDifficulty === difficulty.value
                                                    ? `bg-${difficulty.color}-500 text-white`
                                                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                                            }`}
                                        >
                                            {difficulty.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleRandomPrompt}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                            >
                                <Shuffle className="w-4 h-4" />
                                <span>Random</span>
                            </button>
                            
                            <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={previousPrompt}
                                    className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-white text-sm">
                                    {currentPromptIndex + 1} / {filteredPrompts.length}
                                </span>
                                <button
                                    onClick={nextPrompt}
                                    className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Prompt Card */}
                    {currentPrompt && (
                        <div className="mb-8">
                            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${categoryInfo?.color} p-1`}>
                                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${
                                                currentPrompt.difficulty === "easy" ? "bg-green-500" :
                                                currentPrompt.difficulty === "medium" ? "bg-yellow-500" :
                                                "bg-red-500"
                                            }`}></div>
                                            <span className="text-white/80 text-sm uppercase tracking-wider">
                                                {currentPrompt.difficulty}
                                            </span>
                                        </div>
                                        
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
                                            {currentPrompt.text}
                                        </h2>
                                        
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <button
                                                onClick={() => handleCopyPrompt(currentPrompt)}
                                                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Copy</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleSharePrompt(currentPrompt)}
                                                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                            >
                                                <Share className="w-4 h-4" />
                                                <span>Share</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleUsePrompt(currentPrompt)}
                                                className="flex items-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg text-white transition-colors"
                                            >
                                                <Heart className="w-4 h-4" />
                                                <span>Use This</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prompt Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrompts.map((prompt, index) => (
                            <div
                                key={prompt.id}
                                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                                    index === currentPromptIndex ? 'ring-2 ring-pink-400' : ''
                                }`}
                                onClick={() => {
                                    // Set current prompt index
                                    const allPrompts = promptCategories[selectedCategory]?.prompts || [];
                                    const newIndex = allPrompts.findIndex(p => p.id === prompt.id);
                                    // This would need to be implemented in the store
                                }}
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-2 h-2 rounded-full ${
                                            prompt.difficulty === "easy" ? "bg-green-500" :
                                            prompt.difficulty === "medium" ? "bg-yellow-500" :
                                            "bg-red-500"
                                        }`}></div>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyPrompt(prompt);
                                                }}
                                                className="p-1 hover:bg-white/20 rounded"
                                            >
                                                <Copy className="w-3 h-3 text-gray-300" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSharePrompt(prompt);
                                                }}
                                                className="p-1 hover:bg-white/20 rounded"
                                            >
                                                <Share className="w-3 h-3 text-gray-300" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-white text-sm leading-relaxed">
                                        {prompt.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Enhancement Notice */}
                    {authUser?.aiAssistantEnabled && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-white/10">
                            <div className="flex items-center space-x-3 mb-3">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">AI Enhancement</h3>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Your AI assistant can personalize these prompts based on your match's profile and conversation history. 
                                Enable AI suggestions in your chat to get customized conversation starters.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PromptsPage;