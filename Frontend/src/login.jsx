import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import backgroundImage from "./loginbg.jpg"; // Adjust path if needed

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Registration failed. " + err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Logo/Title Area */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-2">
            🌾 Rice Disease
          </h1>
          <p className="text-white/90 text-lg drop-shadow-lg">
            Detection System
          </p>
        </div>

        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            {isRegistering ? "🌱 Create Account" : "🔐 Welcome Back"}
          </h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg animate-fade-in">
              <p className="font-semibold">❌ {error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            {isRegistering && (
              <div className="animate-fade-in">
                <label className="block text-gray-700 font-semibold mb-2">
                  🔒 Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:from-teal-500 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isRegistering ? "🚀 Create Account" : "✨ Sign In"}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-semibold">OR</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={isRegistering ? handleGoogleSignUp : handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all"
            >
              {isRegistering
                ? "Already have an account? Sign In →"
                : "Don't have an account? Create one →"}
            </button>
          </div>
        </form>
        
        {/* Footer Info */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>🔒 Secure authentication powered by Firebase</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
