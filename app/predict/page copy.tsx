"use client";

import { useState } from "react";

export const metadata = {
  title: "Prediction - DR.AI",
  description: "Read my blog.",
};

export default function Page() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      document.getElementById("file-info").classList.remove("hidden");
      document.getElementById("file-name").textContent = f.name;
      document.getElementById("file-size").textContent =
        (f.size / 1024).toFixed(2) + " KB";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Prediction Result:", data);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex-grow pt-24 pb-16 px-4 w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 mb-4">
            AI-Powered DR Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a retinal image and get instant diabetic retinopathy grade
            prediction with advanced AI analysis
          </p>
        </div>

        {/* Upload Form */}
        <div className="max-w-4xl mx-auto mb-12">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            id="upload-form"
            className="glass-effect p-8 rounded-2xl shadow-2xl card-hover"
          >
            {/* Progress Indicator */}
            <div
              className="flex items-center justify-center mb-8"
              id="progress-indicator"
            >
              <div className="flex items-center space-x-4">
                <div
                  id="step-1"
                  className="flex items-center justify-center w-8 h-8 bg-teal-600 text-white rounded-full font-semibold"
                >
                  1
                </div>
                <div id="bar-1-2" className="w-16 h-1 bg-teal-600 rounded" />
                <div
                  id="step-2"
                  className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full font-semibold"
                >
                  2
                </div>
                <div id="bar-2-3" className="w-16 h-1 bg-gray-300 rounded" />
                <div
                  id="step-3"
                  className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full font-semibold"
                >
                  3
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <label
              htmlFor="original"
              id="drop-zone"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-48 cursor-pointer hover:border-teal-500 transition-all duration-300 bg-white/50"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <p
                  id="drop-zone-text"
                  className="text-gray-600 text-lg font-medium"
                >
                  Drag &amp; drop your retinal image here or click to browse
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Supports JPG, PNG, JPEG formats
                </p>
              </div>
              <input
                type="file"
                name="original"
                id="original"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* File Info Display */}
            <div id="file-info" className="mt-4 hidden">
              <div className="flex items-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl mr-3">📄</div>
                <div>
                  <p id="file-name" className="font-semibold text-teal-800" />
                  <p id="file-size" className="text-teal-600 text-sm" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 mt-6 shadow-lg"
            >
              {!loading ? (
                <span id="submit-text">🔍 Analyze Image</span>
              ) : (
                <span id="loading-text">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx={12}
                      cy={12}
                      r={10}
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">
              Prediction Result
            </h2>
            <pre className="text-gray-800 whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </>
  );
}
