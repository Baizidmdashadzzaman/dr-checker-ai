"use client";

import { useState, useEffect } from "react";
import { predictDR } from "../api/huggingface";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Types for API response
type Predictions = {
  [label: string]: number;
};

type DRResult = {
  predictions: Predictions;
  heatmap: string;
};

export default function ClientPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DRResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      document.getElementById("file-info")?.classList.remove("hidden");
      document.getElementById("file-name")!.textContent = f.name;
      document.getElementById("file-size")!.textContent =
        (f.size / 1024).toFixed(2) + " KB";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image");

    setLoading(true);
    setResult(null);

    try {
      const data = await predictDR(file);
      console.log("Prediction Result:", data);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  // Get highest predicted label
  const getTopPrediction = (predictions: Predictions) => {
    const sorted = Object.entries(predictions).sort((a, b) => b[1] - a[1]);
    return sorted[0];
  };

  return (
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

          {/* File Info */}
          <div id="file-info" className="mt-4 hidden">
            <div className="flex items-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl mr-3">📄</div>
              <div>
                <p id="file-name" className="font-semibold text-teal-800" />
                <p id="file-size" className="text-teal-600 text-sm" />
              </div>
            </div>
          </div>

          {/* Show Uploaded Image Preview */}
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full max-h-80 object-contain rounded-xl border shadow-md"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 mt-6 shadow-lg"
          >
            {!loading ? (
              "🔍 Analyze Image"
            ) : (
              <span className="flex items-center justify-center">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Result Section */}
      {result && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-teal-700 mb-4">
            Prediction Result
          </h2>

          {/* Top Prediction */}
          <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-600 rounded">
            <h3 className="text-lg font-semibold text-teal-800">
              Top Prediction:
            </h3>
            <p className="text-xl">
              {getTopPrediction(result.predictions)[0]} —{" "}
              {(getTopPrediction(result.predictions)[1] * 100).toFixed(2)}%
            </p>
          </div>

          {/* Prediction Chart */}
          <div className="mt-4">
            <Bar
              data={{
                labels: Object.keys(result.predictions),
                datasets: [
                  {
                    label: "Prediction Confidence (%)",
                    data: Object.values(result.predictions).map(
                      (p) => p * 100
                    ),
                    backgroundColor: "rgba(13, 148, 136, 0.7)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Prediction Distribution" },
                },
              }}
            />
          </div>

          {/* Heatmap */}
          {result.heatmap && (
            <div className="mt-6">
              <h3 className="font-semibold text-teal-600 mb-2">Heatmap</h3>
              <img
                src={result.heatmap}
                alt="Grad-CAM Heatmap"
                className="w-full rounded-xl shadow-md"
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
