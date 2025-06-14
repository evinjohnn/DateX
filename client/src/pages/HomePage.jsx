import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/Header";
import { useMatchStore } from "../store/useMatchStore";
import { Frown, Loader2, Sparkles } from "lucide-react";
import SwipeArea from "../components/SwipeArea";
import SwipeFeedback from "../components/SwipeFeedback";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const { 
    isLoadingUserProfiles, 
    getUserProfiles, 
    userProfiles, 
    subscribeToNewMatches, 
    unsubscribeFromNewMatches 
  } = useMatchStore();

  const { authUser } = useAuthStore();

  useEffect(() => {
    getUserProfiles();
  }, [getUserProfiles]);

  useEffect(() => {
    authUser && subscribeToNewMatches();
    return () => {
      unsubscribeFromNewMatches();
    };
  }, [subscribeToNewMatches, unsubscribeFromNewMatches, authUser]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, yellow 2%, transparent 0%), 
              radial-gradient(circle at 75px 75px, yellow 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <div className="relative flex h-screen">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Header />
          <main className="flex-grow flex flex-col justify-center items-center p-4 relative">
            {userProfiles.length > 0 && !isLoadingUserProfiles && (
              <div className="relative">
                <SwipeArea />
                <SwipeFeedback />
                
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
              </div>
            )}
            
            {userProfiles.length === 0 && !isLoadingUserProfiles && <NoMoreProfiles />}
            {isLoadingUserProfiles && <LoadingUI />}
          </main>
        </div>
      </div>
    </div>
  );
};

const NoMoreProfiles = () => (
  <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-12 border border-yellow-400/20 shadow-2xl">
    <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
    <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
    
    <div className="relative">
      <div className="bg-black/40 p-6 rounded-2xl mb-8">
        <Frown className="text-yellow-400 mx-auto animate-bounce" size={80} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">
        No More Profiles
      </h2>
      <p className="text-lg text-gray-400 max-w-sm">
        Looks like you've reached the end! Check back later for new people in your area.
      </p>
    </div>
  </div>
);

const LoadingUI = () => {
  return (
    <div className="relative w-full max-w-sm h-[32rem]">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent blur-3xl" />
      
      <div className="relative bg-gray-900/80 backdrop-blur-xl w-96 h-[32rem] rounded-3xl border border-yellow-400/20 shadow-2xl overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <Loader2 className="text-yellow-400 animate-spin mb-4" size={48} />
          <div className="flex items-center gap-2 text-yellow-400">
            <Sparkles size={20} />
            <span className="text-lg font-medium">Finding matches</span>
            <Sparkles size={20} />
          </div>
        </div>

        <div className="px-4 pt-4 h-3/4">
          <div className="w-full h-full bg-black/40 rounded-2xl animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-6 bg-black/40 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-black/40 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;