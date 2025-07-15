// client/src/App.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// Pages
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import LikesYouPage from "./pages/LikesYouPage";
import ChatListPage from "./pages/ChatPage";
import ConversationPage from "./pages/ConversationPage";
import StandoutsPage from "./pages/StandoutsPage";
import SettingsPage from "./pages/SettingsPage";
import PremiumPage from "./pages/PremiumPage";
import PromptsPage from "./pages/PromptsPage";

// Store
import { useAuthStore } from "./store/useAuthStore";

// Context
import { ThemeProvider } from "./context/ThemeContext";

function App() {
    const { checkAuth, authUser, checkingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Show full-screen loader while checking auth status
    if (checkingAuth) {
        return (
            <div className="h-screen w-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="w-16 h-16 rounded-full border-4 border-pink-200 dark:border-pink-800"></div>
                        <div className="w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Loading Hinge
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Preparing your perfect matches...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
                <Routes>
                    {/* Public Routes */}
                    <Route 
                        path='/auth' 
                        element={!authUser ? <AuthPage /> : <Navigate to="/" />} 
                    />
                    
                    {/* Protected Routes */}
                    <Route 
                        path='/' 
                        element={authUser ? (
                            isProfileComplete(authUser) ? <HomePage /> : <Navigate to="/onboarding" />
                        ) : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/onboarding' 
                        element={authUser ? <OnboardingPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/profile' 
                        element={authUser ? <ProfilePage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/likes' 
                        element={authUser ? <LikesYouPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/standouts' 
                        element={authUser ? <StandoutsPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/chat' 
                        element={authUser ? <ChatListPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/chat/:id' 
                        element={authUser ? <ConversationPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/settings' 
                        element={authUser ? <SettingsPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/premium' 
                        element={authUser ? <PremiumPage /> : <Navigate to="/auth" />} 
                    />
                    
                    <Route 
                        path='/prompts' 
                        element={authUser ? <PromptsPage /> : <Navigate to="/auth" />} 
                    />
                </Routes>
                
                <Toaster 
                    position="top-center" 
                    toastOptions={{
                        duration: 4000,
                        style: { 
                            background: 'rgba(255, 255, 255, 0.95)', 
                            color: '#374151',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#FFFFFF',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#FFFFFF',
                            },
                        },
                    }}
                />
            </div>
        </ThemeProvider>
    );
}

// Helper function to check if profile is complete
const isProfileComplete = (user) => {
    if (!user) return false;
    
    const hasBasicInfo = user.name && user.age && user.job;
    const hasImages = user.images && user.images.length >= 3;
    const hasPrompts = user.prompts && user.prompts.length >= 3 && 
                      user.prompts.every(p => p.answer && p.answer.trim());
    const hasQuestionnaire = user.questionnaire && 
                             Object.keys(user.questionnaire).length >= 5;
    
    return hasBasicInfo && hasImages && hasPrompts && hasQuestionnaire;
};

export default App;