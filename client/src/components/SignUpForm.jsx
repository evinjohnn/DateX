import { useState } from "react";
import backgroundImage from '../images/img2.jpg';
import { useAuthStore } from "../store/useAuthStore";


const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const { signup, loading } = useAuthStore();

  const inputClass = "w-full px-4 py-2 bg-black/20 backdrop-blur-xl text-white rounded-full border border-zinc-700/30 focus:outline-none focus:border-yellow-400 transition-colors text-sm";
  const buttonClass = (isActive) => `w-full py-2 rounded-full transition-colors duration-200 text-sm ${
    isActive ? "bg-yellow-400 text-black" : "bg-black/20 backdrop-blur-xl text-gray-300 border border-zinc-700/30"
  }`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={inputClass}
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />

      <div className="space-y-2">
        <div className="text-xs text-gray-400 px-1">I am a:</div>
        <div className="grid grid-cols-2 gap-3">
          {["male", "female"].map((option) => (
            <button
              key={option}
              onClick={() => setGender(option)}
              className={buttonClass(gender === option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 px-1">I want to meet:</div>
        <div className="grid grid-cols-3 gap-3">
          {["male", "female", "both"].map((option) => (
            <button
              key={option}
              onClick={() => setGenderPreference(option)}
              className={buttonClass(genderPreference === option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          signup({ name, email, password, gender, age, genderPreference });
        }}
        disabled={loading}
        className="w-full py-2.5 rounded-full font-medium text-black text-sm transition-all hover:scale-[1.02]"
        style={{
          background: "linear-gradient(45deg, #F8B704, #FFC629)",
          boxShadow: "0 2px 10px rgba(248, 183, 4, 0.3)"
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </div>
  );
};

export default SignUpForm;