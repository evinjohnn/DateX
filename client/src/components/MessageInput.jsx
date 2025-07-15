import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useAIStore } from "../store/useAIStore";
import { Send, Smile, Mic, Camera, Image, Paperclip, Sparkles, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ match }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const emojiPickerRef = useRef(null);
  const attachmentRef = useRef(null);
  const aiSuggestionsRef = useRef(null);
  const { sendMessage } = useMessageStore();
  const { getChatSuggestions, chatSuggestions, isLoading } = useAIStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(match._id, message);
      setMessage("");
      setShowAISuggestions(false);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleAttachment = (type) => {
    setShowAttachments(false);
    // TODO: Implement attachment functionality
    console.log(`Attachment type: ${type}`);
  };

  const handleAISuggestion = async () => {
    if (showAISuggestions) {
      setShowAISuggestions(false);
    } else {
      await getChatSuggestions(match._id);
      setShowAISuggestions(true);
    }
  };

  const selectSuggestion = (suggestion) => {
    setMessage(suggestion);
    setShowAISuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (attachmentRef.current && !attachmentRef.current.contains(event.target)) {
        setShowAttachments(false);
      }
      if (aiSuggestionsRef.current && !aiSuggestionsRef.current.contains(event.target)) {
        setShowAISuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = chatSuggestions[match._id] || [];

  return (
    <div className="relative">
      {/* AI Suggestions Popup */}
      {showAISuggestions && (
        <div 
          ref={aiSuggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl max-h-60 overflow-y-auto"
        >
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-pink-400" />
                AI Suggestions
              </h3>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Getting suggestions...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left p-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm p-3">No suggestions available</p>
            )}
          </div>
        </div>
      )}

      {/* Attachment Options */}
      {showAttachments && (
        <div 
          ref={attachmentRef}
          className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-2"
        >
          <div className="space-y-1">
            <button
              onClick={() => handleAttachment('camera')}
              className="flex items-center space-x-3 w-full p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Camera</span>
            </button>
            <button
              onClick={() => handleAttachment('gallery')}
              className="flex items-center space-x-3 w-full p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Image className="w-5 h-5 text-green-400" />
              <span className="text-sm">Gallery</span>
            </button>
            <button
              onClick={() => handleAttachment('file')}
              className="flex items-center space-x-3 w-full p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-purple-400" />
              <span className="text-sm">File</span>
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef} 
          className="absolute bottom-full left-0 mb-2 shadow-xl rounded-xl overflow-hidden
            border border-white/20 bg-black/90 backdrop-blur-sm"
          style={{ zIndex: 50 }}
        >
          <EmojiPicker
            theme="dark"
            onEmojiClick={(emojiObject) => {
              setMessage((prevMessage) => prevMessage + emojiObject.emoji);
            }}
          />
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSendMessage} className="flex relative">
        {/* Left Side Buttons */}
        <div className="flex items-center space-x-1 mr-2">
          <button
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <Paperclip size={20} />
          </button>
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-pink-400 hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            onClick={handleAISuggestion}
            className={`p-2 hover:bg-white/10 rounded-full transition-all duration-200 ${
              showAISuggestions ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
            }`}
          >
            <Sparkles size={20} />
          </button>
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow px-4 py-3 rounded-full bg-white/10 border border-white/20
            backdrop-blur-sm placeholder:text-gray-400 text-white
            focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20
            transition-all duration-200"
          placeholder="Type a message..."
        />

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-1 ml-2">
          <button
            type="button"
            onClick={handleVoiceRecord}
            className={`p-2 hover:bg-white/10 rounded-full transition-all duration-200 ${
              isRecording ? 'text-red-400' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <Mic size={20} />
          </button>

          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-full
              hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/25 
              disabled:opacity-50 disabled:hover:from-pink-500 disabled:hover:to-purple-600
              transition-all duration-200"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;