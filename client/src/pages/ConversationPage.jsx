// client/src/pages/ConversationPage.jsx
import { useEffect, useRef, useState } from "react";
import { useAuthStore, useMatchStore, useMessageStore } from "../store";
import { useAIStore } from "../store/useAIStore";
import { Link, useParams } from "react-router-dom";
import { 
    Loader2, 
    UserX, 
    Phone, 
    ChevronLeft, 
    Video as VideoCamera, 
    MoreVertical,
    Heart,
    Laugh,
    ThumbsUp,
    Angry,
    Lightbulb,
    Sparkles,
    MessageCircle,
    Mic,
    Camera,
    Image,
    Paperclip
} from "lucide-react";
import MessageInput from "../components/MessageInput";
import Layout from "../components/Layout";

const ConversationPage = () => {
    const { id } = useParams();
    const messagesEndRef = useRef(null);
    const { getFeeds } = useMatchStore.getState();
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showReactions, setShowReactions] = useState(null);

    const { match } = useMatchStore((state) => ({
        match: state.matches.find((m) => m._id === id),
    }));

    const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages, loading } = useMessageStore();
    const { authUser } = useAuthStore();
    const { 
        getChatSuggestions, 
        getConversationStarters, 
        analyzeMood, 
        chatSuggestions, 
        conversationStarters, 
        moodAnalysis, 
        isLoading: aiLoading 
    } = useAIStore();

    useEffect(() => {
        // If we don't have the match data, fetch everything
        if (!match) {
            getFeeds();
        }
    }, [id, match, getFeeds]);

    useEffect(() => {
        if (id) {
            getMessages(id);
            subscribeToMessages();
            
            // Load AI suggestions if enabled
            if (authUser?.aiAssistantEnabled) {
                getChatSuggestions(id);
                if (messages.length === 0) {
                    getConversationStarters(id);
                }
                analyzeMood(id);
            }
        }
        return () => {
            unsubscribeFromMessages();
        };
    }, [id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleMessageReaction = (messageId, reaction) => {
        // TODO: Implement message reaction API
        console.log(`React to message ${messageId} with ${reaction}`);
        setShowReactions(null);
    };

    const handleSuggestionClick = (suggestion) => {
        // Auto-fill the message input with the suggestion
        const messageInputElement = document.querySelector('input[type="text"]');
        if (messageInputElement) {
            messageInputElement.value = suggestion;
            messageInputElement.focus();
        }
    };

    const reactions = [
        { emoji: '❤️', name: 'love', icon: Heart },
        { emoji: '😂', name: 'laugh', icon: Laugh },
        { emoji: '👍', name: 'like', icon: ThumbsUp },
        { emoji: '😮', name: 'wow', icon: MessageCircle },
        { emoji: '😢', name: 'sad', icon: UserX },
        { emoji: '😠', name: 'angry', icon: Angry },
    ];

    if (loading) return <LoadingMessagesUI />;
    if (!match) return <MatchNotFound />;

    const currentMood = moodAnalysis[id];
    const suggestions = chatSuggestions[id] || [];
    const starters = conversationStarters[id] || [];

    return (
        <Layout>
            <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
                <div className='flex-grow flex flex-col overflow-hidden max-w-4xl mx-auto w-full'>
                    {/* Header */}
                    <div className='bg-black/80 backdrop-blur-md sticky top-0 z-10 p-4 shadow-lg border-b border-white/10'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <Link to={"/chat"} className='text-gray-400 hover:text-pink-400 p-2 -ml-2 transition-colors'>
                                    <ChevronLeft size={24}/>
                                </Link>
                                <div className="relative">
                                    <img
                                        src={match.images?.[0] || "/avatar.png"}
                                        className='w-12 h-12 object-cover rounded-full border-2 border-pink-400 shadow-md'
                                        alt={match.name}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                                </div>
                                <div>
                                    <h2 className='text-lg font-bold text-white'>{match.name}</h2>
                                    <div className="flex items-center space-x-2">
                                        <span className='text-xs text-green-400'>Online</span>
                                        {currentMood && (
                                            <span className='text-xs text-gray-400'>
                                                • {currentMood.currentMood}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center space-x-2 text-gray-400'>
                                <button className='p-2 hover:bg-white/10 rounded-full transition-colors'>
                                    <Phone className='w-5 h-5' />
                                </button>
                                <button className='p-2 hover:bg-white/10 rounded-full transition-colors'>
                                    <VideoCamera className='w-5 h-5' />
                                </button>
                                {authUser?.aiAssistantEnabled && (
                                    <button 
                                        onClick={() => setShowAIPanel(!showAIPanel)}
                                        className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showAIPanel ? 'text-pink-400' : ''}`}
                                    >
                                        <Sparkles className='w-5 h-5' />
                                    </button>
                                )}
                                <button className='p-2 hover:bg-white/10 rounded-full transition-colors'>
                                    <MoreVertical className='w-5 h-5' />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-grow overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-grow flex flex-col">
                            {/* AI Suggestions Banner */}
                            {showAIPanel && authUser?.aiAssistantEnabled && (
                                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-white/10 p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                                    </div>
                                    
                                    {currentMood && (
                                        <div className="mb-3 p-3 bg-black/30 rounded-lg">
                                            <div className="text-xs text-gray-400 mb-1">Conversation Mood</div>
                                            <div className="text-sm text-white capitalize">{currentMood.currentMood}</div>
                                            <div className="text-xs text-gray-400 mt-1">{currentMood.suggestedApproach}</div>
                                        </div>
                                    )}

                                    {suggestions.length > 0 && (
                                        <div className="mb-3">
                                            <div className="text-xs text-gray-400 mb-2">Suggested Responses</div>
                                            <div className="space-y-2">
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left p-3 bg-black/20 hover:bg-black/40 rounded-lg text-sm text-white transition-colors"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {starters.length > 0 && messages.length === 0 && (
                                        <div>
                                            <div className="text-xs text-gray-400 mb-2">Conversation Starters</div>
                                            <div className="space-y-2">
                                                {starters.map((starter, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(starter.message)}
                                                        className="w-full text-left p-3 bg-black/20 hover:bg-black/40 rounded-lg text-sm text-white transition-colors"
                                                    >
                                                        {starter.message}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Messages */}
                            <div className='flex-grow overflow-y-auto p-4 space-y-4'>
                                {messages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">Start your conversation with {match.name}</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={msg._id}
                                            className={`flex ${msg.sender === authUser._id ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className="relative group">
                                                <div 
                                                    className={`max-w-[75%] p-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${
                                                        msg.sender === authUser._id 
                                                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none" 
                                                            : "bg-white/10 text-white rounded-bl-none border border-white/20"
                                                    }`}
                                                    onDoubleClick={() => setShowReactions(msg._id)}
                                                >
                                                    <p className='text-sm md:text-base'>{msg.content}</p>
                                                    <div className={`text-xs mt-1 opacity-70 ${
                                                        msg.sender === authUser._id ? "text-white" : "text-gray-400"
                                                    }`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Reaction Button */}
                                                <button
                                                    onClick={() => setShowReactions(showReactions === msg._id ? null : msg._id)}
                                                    className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white p-1 rounded-full text-xs"
                                                >
                                                    ❤️
                                                </button>

                                                {/* Reaction Picker */}
                                                {showReactions === msg._id && (
                                                    <div className="absolute top-full left-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex space-x-2 shadow-xl border border-white/20 z-10">
                                                        {reactions.map((reaction) => (
                                                            <button
                                                                key={reaction.name}
                                                                onClick={() => handleMessageReaction(msg._id, reaction.name)}
                                                                className="hover:bg-white/10 p-2 rounded-full transition-colors text-lg"
                                                            >
                                                                {reaction.emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Message Input */}
                    <div className='p-4 bg-black/80 backdrop-blur-md border-t border-white/10'>
                        <MessageInput match={match} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const MatchNotFound = () => (
    <div className='h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white'>
        <UserX size={64} className='mx-auto text-red-500 mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Match Not Found</h2>
        <Link to="/" className='px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all'>
            Back to Discover
        </Link>
    </div>
);

const LoadingMessagesUI = () => (
    <div className='h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white'>
        <div className="text-center">
            <Loader2 size={48} className='mx-auto text-pink-400 animate-spin mb-4' />
            <p className="text-gray-400">Loading conversation...</p>
        </div>
    </div>
);

export default ConversationPage;