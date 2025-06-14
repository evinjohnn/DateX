import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ match }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = useMessageStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(match._id, message);
      setMessage("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-4 bg-black">
      <form onSubmit={handleSendMessage} className="flex relative max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 
            hover:text-yellow-400 hover:scale-110 transition-all duration-200"
        >
          <Smile size={20} />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow px-12 py-3 rounded-full bg-zinc-900 border border-zinc-800
            shadow-lg placeholder:text-gray-500 text-white
            focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20
            transition-all duration-200"
          placeholder="Type a message..."
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2
            bg-yellow-400 text-black p-2 rounded-full
            hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 
            disabled:opacity-50 disabled:hover:bg-yellow-400
            transition-all duration-200"
        >
          <Send size={20} className="transform rotate-45" />
        </button>

        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef} 
            className="absolute bottom-full left-0 mb-2 shadow-xl rounded-xl overflow-hidden
              border border-zinc-800 bg-zinc-900"
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
      </form>
    </div>
  );
};

export default MessageInput;