import { useState } from "react";
import backgroundImage from '../images/img2.jpg';
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen flex items-center justify-center bg-black bg-opacity-95 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(26, 26, 26, 0.7)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div 
        className="absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
        }}
      />

      <div className="w-full max-w-md relative z-20 px-4">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/20" />
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {isLogin ? "Sign in to continue your journey" : "Join millions of others"}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-black/30 rounded-2xl p-6 border border-zinc-700/30 shadow-2xl">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-300">
              {isLogin ? "New to the app?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-1 text-yellow-400 hover:text-yellow-300 font-semibold"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-300">
          By continuing, you agree to our{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-yellow-400 hover:text-yellow-300">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;