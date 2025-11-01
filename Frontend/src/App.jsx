import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Login from "./login";
import backgroundImage from "./t.jpg";

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
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("image");
  const [userName, setUserName] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.email?.split("@")[0] || "User");
    }
  }, [isLoggedIn]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setFileName(file.name);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setTabularData({ ...tabularData, [e.target.name]: e.target.value });
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        `${API_URL}/predict-image/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      console.log("✅ Prediction successful:", response.data);
      setMessage(response.data.message);

      // Save prediction to Firestore (with separate error handling)
      try {
        await addDoc(collection(db, "predictions"), {
          type: "Image",
          result: response.data.message,
          timestamp: new Date(),
          userName: userName,
          userId: auth.currentUser?.uid, // For security rules
        });
        console.log("✅ Saved to Firestore");
      } catch (dbError) {
        console.warn("⚠️ Firestore save failed (prediction still succeeded):", dbError);
        // Don't throw - prediction worked, just DB save failed
      }
    } catch (error) {
      console.error("❌ Prediction error:", error);
      console.error("Error response:", error.response?.data);
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
      const response = await axios.post(
        `${API_URL}/predict-tabular/`,
        tabularData
      );
      
      console.log("✅ Environmental prediction successful:", response.data);
      setMessage(response.data.message);

      // Save prediction to Firestore (with separate error handling)
      try {
        await addDoc(collection(db, "predictions"), {
          type: "Tabular",
          result: response.data.message,
          data: tabularData,
          timestamp: new Date(),
          userName: userName,
          userId: auth.currentUser?.uid, // For security rules
        });
        console.log("✅ Saved to Firestore");
      } catch (dbError) {
        console.warn("⚠️ Firestore save failed (prediction still succeeded):", dbError);
        // Don't throw - prediction worked, just DB save failed
      }
    } catch (error) {
      console.error("❌ Environmental prediction error:", error);
      console.error("Error response:", error.response?.data);
      setMessage("Error processing tabular data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastPredictions = async () => {
    try {
      // Only fetch current user's predictions (more secure)
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
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      // Fallback: try fetching all (will work if security rules allow)
      try {
        const querySnapshot = await getDocs(collection(db, "predictions"));
        const predictions = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((pred) => pred.userId === auth.currentUser?.uid)
          .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setPastPredictions(predictions);
        setShowHistory(true);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Header with gradient overlay */}
      <div className="bg-gradient-to-b from-black/70 via-black/50 to-transparent py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              🌾 Rice Disease Detection System
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Welcome back, <span className="font-semibold">{userName}</span>!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500/90 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Analyzing...</p>
            </div>
          </div>
        )}

        {/* Result Message */}
        {message && (
          <div className="max-w-3xl mx-auto mb-6 animate-fade-in">
            <div className={`rounded-xl p-6 shadow-2xl backdrop-blur-md ${
              message.includes("healthy") || message.includes("good")
                ? "bg-green-500/90 border-2 border-green-300"
                : "bg-orange-500/90 border-2 border-orange-300"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">
                    {message.includes("healthy") || message.includes("good") ? "✅" : "⚠️"}
                  </span>
                  <p className="text-white font-semibold text-lg">{message}</p>
                </div>
                <button
                  onClick={() => setMessage("")}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 shadow-lg inline-flex space-x-2">
            <button
              onClick={() => setActiveTab("image")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "image"
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              📸 Image Detection
            </button>
            <button
              onClick={() => setActiveTab("environmental")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "environmental"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              🌡️ Environmental Data
            </button>
            <button
              onClick={() => {
                fetchPastPredictions();
                setActiveTab("history");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              📜 History
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {/* Image Detection Tab */}
          {activeTab === "image" && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Upload Rice Plant Image
                </h2>
                <p className="text-gray-600">
                  Upload a clear image of the rice plant leaf for disease detection
                </p>
              </div>

              <form onSubmit={submitImage} className="space-y-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 rounded-xl shadow-lg border-4 border-green-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImage(null);
                          setFileName("No file chosen");
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="image-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="image-input"
                    className="cursor-pointer block"
                  >
                    <div className="text-6xl mb-4">📷</div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-lg inline-block hover:from-teal-500 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Choose Image File
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">{fileName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: JPG, PNG, JPEG
                    </p>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!image || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-teal-500 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? "Analyzing..." : "🔍 Detect Disease"}
                </button>
              </form>
            </div>
          )}

          {/* Environmental Data Tab */}
          {activeTab === "environmental" && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Environmental Conditions
                </h2>
                <p className="text-gray-600">
                  Enter environmental parameters to check crop conditions
                </p>
              </div>

              <form onSubmit={submitTabularData} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "🌡️ Maximum Temperature (°C)", name: "Maximum_Temperature", placeholder: "e.g., 35" },
                    { label: "❄️ Minimum Temperature (°C)", name: "Minimum_Temperature", placeholder: "e.g., 20" },
                    { label: "🌡️ Average Temperature (°C)", name: "Temperature", placeholder: "e.g., 27.5" },
                    { label: "🌧️ Precipitation (mm)", name: "Precipitation", placeholder: "e.g., 150" },
                    { label: "🧪 Soil pH", name: "Soil_pH", placeholder: "e.g., 6.5" },
                    { label: "💧 Relative Humidity (%)", name: "Relative_Humidity", placeholder: "e.g., 75" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-gray-700 font-semibold mb-2">
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg mt-6"
                >
                  {loading ? "Analyzing..." : "🌾 Check Conditions"}
                </button>
              </form>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Prediction History
                </h2>
                <p className="text-gray-600">
                  View your past disease detection results
                </p>
              </div>

              {pastPredictions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg">No predictions yet</p>
                  <p className="text-gray-400 mt-2">Start by uploading an image or environmental data</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {pastPredictions.map((pred, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">
                              {pred.type === "Image" ? "📸" : "🌡️"}
                            </span>
                            <span className="font-semibold text-gray-700">
                              {pred.type} Detection
                            </span>
                            {pred.userName && (
                              <span className="text-sm text-gray-500">
                                by {pred.userName}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 ml-8">{pred.result}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {pred.timestamp?.toDate().toLocaleString()}
                        </div>
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
      <div className="text-center py-6 text-white/80 text-sm">
        <p>© 2024 Rice Disease Detection System | Powered by AI & Machine Learning</p>
      </div>
    </div>
  ) : (
    <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

export default App;
