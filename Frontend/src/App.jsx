import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useGSAP } from "@gsap/react";
import Login from "./login";
import ThemeToggle from "./components/ThemeToggle";
import RiceBackground from "./components/RiceBackground";
import { animateTabSwitch, animateResultReveal, animateHistoryItems, animateHeader } from "./utils/animations";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tabularData, setTabularData] = useState({
    Maximum_Temperature: "",
    Minimum_Temperature: "",
    Temperature: "",
    Precipitation: "",
    Soil_pH: "",
    Relative_Humidity: "",
  });
  const [pastPredictions, setPastPredictions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [activeTab, setActiveTab] = useState("image");
  const [userName, setUserName] = useState("");

  const tabContentRef = useRef(null);
  const resultRef = useRef(null);
  const historyRef = useRef(null);
  const headerRef = useRef(null);

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "User");
    }
  }, [isLoggedIn]);

  useGSAP(() => {
    if (isLoggedIn && headerRef.current) {
      animateHeader(headerRef.current);
    }
  }, [isLoggedIn]);

  useGSAP(() => {
    if (tabContentRef.current) {
      animateTabSwitch(tabContentRef.current);
    }
  }, [activeTab]);

  useGSAP(() => {
    if (message && resultRef.current) {
      animateResultReveal(resultRef.current);
    }
  }, [message]);

  useGSAP(() => {
    if (activeTab === "history" && historyRef.current) {
      const items = historyRef.current.querySelectorAll(".history-item");
      animateHistoryItems(items);
    }
  }, [activeTab, pastPredictions]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setTabularData({ ...tabularData, [e.target.name]: e.target.value });
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", image);
    try {
      const response = await axios.post(`${API_URL}/predict-image/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      try {
        await addDoc(collection(db, "predictions"), {
          type: "Image",
          result: response.data.message,
          timestamp: new Date(),
          userName,
          userId: auth.currentUser?.uid,
        });
      } catch (dbError) {
        console.warn("Firestore save failed:", dbError);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setMessage("Error processing the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitTabularData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${API_URL}/predict-tabular/`, tabularData);
      setMessage(response.data.message);
      try {
        await addDoc(collection(db, "predictions"), {
          type: "Tabular",
          result: response.data.message,
          data: tabularData,
          timestamp: new Date(),
          userName,
          userId: auth.currentUser?.uid,
        });
      } catch (dbError) {
        console.warn("Firestore save failed:", dbError);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setMessage("Error processing tabular data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastPredictions = async () => {
    try {
      const { query, where } = await import("firebase/firestore");
      const q = query(
        collection(db, "predictions"),
        where("userId", "==", auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const predictions = querySnapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      setPastPredictions(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      try {
        const querySnapshot = await getDocs(collection(db, "predictions"));
        const predictions = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((pred) => pred.userId === auth.currentUser?.uid)
          .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setPastPredictions(predictions);
      } catch (fallbackError) {
        console.error("Fallback fetch failed:", fallbackError);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const isPositive = message.includes("healthy") || message.includes("good");

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base background color */}
      <div className="fixed inset-0 bg-background -z-20" />

      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <RiceBackground variant="subtle" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header ref={headerRef} className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Rice Disease Detection
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Welcome, <span className="font-medium text-foreground">{userName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium
                  py-2 px-5 rounded-lg transition-all duration-200 text-sm cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card rounded-xl p-8 shadow-xl border border-border text-center">
                <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-medium">Analyzing...</p>
              </div>
            </div>
          )}

          {/* Result */}
          {message && (
            <div ref={resultRef} className="max-w-3xl mx-auto mb-6">
              <div className={`rounded-xl p-5 shadow-lg border ${
                isPositive
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{message}</p>
                  <button
                    onClick={() => setMessage("")}
                    className="ml-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-card/80 backdrop-blur-md rounded-lg p-1.5 shadow-sm border border-border inline-flex gap-1">
              {[
                { id: "image", label: "Image Detection" },
                { id: "environmental", label: "Environmental Data" },
                { id: "history", label: "History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "history") fetchPastPredictions();
                    setActiveTab(tab.id);
                  }}
                  className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div ref={tabContentRef} className="max-w-4xl mx-auto">
            {/* Image Detection */}
            {activeTab === "image" && (
              <div className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-border">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-1">
                    Upload Rice Plant Image
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Upload a clear image of the rice plant leaf for disease detection
                  </p>
                </div>

                <form onSubmit={submitImage} className="space-y-6">
                  {imagePreview && (
                    <div className="flex justify-center">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 rounded-lg shadow-md border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImage(null);
                            setFileName("No file chosen");
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground
                            rounded-full w-7 h-7 flex items-center justify-center
                            hover:scale-110 transition-transform shadow-md cursor-pointer text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center
                    hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="image-input"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-input" className="cursor-pointer block">
                      <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="inline-block bg-primary text-primary-foreground font-medium
                        py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity text-sm">
                        Choose Image File
                      </span>
                      <p className="mt-3 text-muted-foreground text-sm font-medium">{fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, JPEG</p>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!image || loading}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-lg
                      hover:opacity-90 transition-all duration-200
                      shadow-sm hover:shadow-md
                      disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Analyzing..." : "Detect Disease"}
                  </button>
                </form>
              </div>
            )}

            {/* Environmental Data */}
            {activeTab === "environmental" && (
              <div className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-border">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-1">
                    Environmental Conditions
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter environmental parameters to check crop conditions
                  </p>
                </div>

                <form onSubmit={submitTabularData} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "Max Temperature (°C)", name: "Maximum_Temperature", placeholder: "e.g., 35" },
                      { label: "Min Temperature (°C)", name: "Minimum_Temperature", placeholder: "e.g., 20" },
                      { label: "Avg Temperature (°C)", name: "Temperature", placeholder: "e.g., 27.5" },
                      { label: "Precipitation (mm)", name: "Precipitation", placeholder: "e.g., 150" },
                      { label: "Soil pH", name: "Soil_pH", placeholder: "e.g., 6.5" },
                      { label: "Relative Humidity (%)", name: "Relative_Humidity", placeholder: "e.g., 75" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-card-foreground font-medium text-sm mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name={field.name}
                          value={tabularData[field.name]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          required
                          className="w-full px-4 py-2.5 bg-background border border-input rounded-lg
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-ring
                            transition-all text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-chart-2 text-white font-semibold py-3.5 rounded-lg
                      hover:opacity-90 transition-all duration-200
                      shadow-sm hover:shadow-md mt-2
                      disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Analyzing..." : "Check Conditions"}
                  </button>
                </form>
              </div>
            )}

            {/* History */}
            {activeTab === "history" && (
              <div className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-border">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-1">
                    Prediction History
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    View your past disease detection results
                  </p>
                </div>

                {pastPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-muted-foreground font-medium">No predictions yet</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Start by uploading an image or environmental data</p>
                  </div>
                ) : (
                  <div ref={historyRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {pastPredictions.map((pred, index) => (
                      <div
                        key={index}
                        className="history-item bg-muted/50 rounded-lg p-4 border border-border
                          hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                pred.type === "Image"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-chart-2/10 text-chart-2"
                              }`}>
                                {pred.type}
                              </span>
                              {pred.userName && (
                                <span className="text-xs text-muted-foreground">
                                  by {pred.userName}
                                </span>
                              )}
                            </div>
                            <p className="text-card-foreground text-sm">{pred.result}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {pred.timestamp?.toDate().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-muted-foreground text-xs">
          <p>&copy; 2025 Rice Disease Detection System &middot; Powered by AI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
