import { useMatchStore } from "../store/useMatchStore";
import { Heart, X, Sparkle } from "lucide-react";
import { useState, useEffect } from "react";

const getFeedbackStyle = (swipeFeedback) => {
  switch (swipeFeedback) {
    case "liked":
      return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black";
    case "passed":
      return "bg-gradient-to-r from-gray-700 to-gray-800 text-white";
    case "matched":
      return "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black";
    default:
      return "";
  }
};

const FeedbackContent = ({ type }) => {
  switch (type) {
    case "liked":
      return (
        <div className="flex items-center gap-2">
          <Heart className="animate-bounce" size={24} fill="currentColor" />
          <span className="font-bold">LIKED!</span>
        </div>
      );
    case "passed":
      return (
        <div className="flex items-center gap-2">
          <X className="animate-pulse" size={24} />
          <span className="font-bold">NOPE</span>
        </div>
      );
    case "matched":
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkle className="animate-spin" size={24} />
            <span className="text-2xl font-bold">IT'S A MATCH!</span>
            <Sparkle className="animate-spin" size={24} />
          </div>
          <span className="text-sm font-medium opacity-75">
            Start a conversation now
          </span>
        </div>
      );
    default:
      return null;
  }
};

const SwipeFeedback = () => {
  const { swipeFeedback } = useMatchStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (swipeFeedback) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [swipeFeedback]);

  if (!swipeFeedback) return null;

  return (
    <div
      className={`
        absolute top-10 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
    >
      <div
        className={`
          ${getFeedbackStyle(swipeFeedback)}
          px-6 py-3 rounded-full
          shadow-lg shadow-black/20
          backdrop-blur-lg
          transform transition-all
          ${swipeFeedback === "matched" ? "px-8 py-4" : ""}
        `}
      >
        <FeedbackContent type={swipeFeedback} />
      </div>

      {/* Matched Animation Overlay */}
      {swipeFeedback === "matched" && (
        <div className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm" />
      )}
    </div>
  );
};

export default SwipeFeedback;