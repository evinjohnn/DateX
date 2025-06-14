import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-6 py-3 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          login({ email, password });
        }}
        disabled={loading}
        className="w-full py-3 px-6 rounded-full font-semibold text-black transition-colors duration-200"
        style={{
          background: "linear-gradient(45deg, #F8B704, #FFC629)",
          boxShadow: "0 2px 10px rgba(248, 183, 4, 0.3)"
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </div>
  );
};

export default LoginForm;