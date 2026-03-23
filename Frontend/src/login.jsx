import React, { useState, useRef, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { gsap } from "gsap";
import RiceBackground from "./components/RiceBackground";

function Login({ onLoginSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const brandRef = useRef(null);
  const cardRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(brandRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1 }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.4'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      gsap.to(containerRef.current, {
        opacity: 0, y: -20, duration: 0.4, ease: 'power2.in',
        onComplete: onLoginSuccess,
      });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 bg-background -z-20" />
      <div className="absolute inset-0 -z-10">
        <RiceBackground variant="dense" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Brand */}
        <div ref={brandRef} className="text-center mb-10 opacity-0">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 20l5-16 5 16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17c2-1.5 4.5-2 8-2s6 .5 8 2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Rice Disease<br/>
            <span className="text-primary">Detection</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-center text-muted-foreground mb-8 opacity-0 text-sm">
          AI-powered analysis for healthier rice crops
        </p>

        {/* Card */}
        <div ref={cardRef} className="opacity-0">
          <div className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-border/60">
            <h2 className="text-xl font-semibold mb-1 text-center text-card-foreground">
              Get Started
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Sign in to analyze plant health
            </p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-6 rounded-lg text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group w-full bg-foreground text-background
                font-semibold py-3.5 px-6 rounded-xl
                hover:opacity-90 transition-all duration-200
                shadow-lg hover:shadow-xl
                flex items-center justify-center gap-3
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-[15px]">{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <div className="flex items-center gap-2 justify-center mt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <p className="text-muted-foreground text-xs">
                Secured by Firebase Authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
