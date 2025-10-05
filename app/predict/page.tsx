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

// --- Custom Data Mapping to match the new template's labels and colors ---
const GRADE_MAP: {
  [key: string]: {
    label: string;
    description: string;
    color: string;
    icon: string;
    level: number; // 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=PDR
  };
} = {
  "No DR": {
    label: "No DR",
    description: "Continue regular monitoring and maintain good blood sugar control.",
    color: "text-green-600",
    icon: "✅",
    level: 0,
  },
  Mild: {
    label: "Mild DR",
    description: "Early stage with microaneurysms present. Regular monitoring recommended.",
    color: "text-yellow-600",
    icon: "⚠️",
    level: 1,
  },
  Moderate: {
    label: "Moderate DR",
    description: "Hemorrhages and other changes visible. Closer monitoring needed.",
    color: "text-orange-600",
    icon: "⚠️",
    level: 2,
  },
  Severe: {
    label: "Severe DR",
    description: "Extensive changes present. Urgent ophthalmologic consultation recommended.",
    color: "text-red-600",
    icon: "🚨",
    level: 3,
  },
  "Proliferative DR": {
    label: "Proliferative DR",
    description: "Advanced stage with new vessel growth. Immediate treatment required.",
    color: "text-red-700",
    icon: "🚨",
    level: 4,
  },
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
      setResult(null); 
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

  // Helper to get the highest predicted label, confidence, and all prediction data
  const getTopPredictionData = (predictions: Predictions) => {
    const sorted = Object.entries(predictions).sort((a, b) => b[1] - a[1]);
    const [label, confidence] = sorted[0] || ["No DR", 0];
    
    const gradeInfo = GRADE_MAP[label] || GRADE_MAP["No DR"]; 

    return {
      label,
      confidence: confidence, // Keep as float 0-1 for percentage conversion
      gradeInfo,
      level: gradeInfo.level,
    };
  };

  const topPredictionData = result ? getTopPredictionData(result.predictions) : null;
  
  // Calculate marker position based on grade level (0 to 4)
  const markerPosition = topPredictionData 
    ? `${(topPredictionData.level / 4) * 100}%` 
    : "0%";

  // Determine the display label for Grade Information based on level
  const getGradeInformationDisplay = (level: number, label: string) => {
      switch(level) {
          case 0: return {
            title: "✅ No signs of diabetic retinopathy detected",
            color: "text-green-600",
            subtitle: "Continue regular monitoring and maintain good blood sugar control."
          };
          case 1: return {
            title: "⚠️ Mild non-proliferative diabetic retinopathy",
            color: "text-yellow-600",
            subtitle: "Early stage with microaneurysms present. Regular monitoring recommended."
          };
          case 2: return {
            title: "⚠️ Moderate non-proliferative diabetic retinopathy",
            color: "text-orange-600",
            subtitle: "Hemorrhages and other changes visible. Closer monitoring needed."
          };
          case 3: return {
            title: "🚨 Severe non-proliferative diabetic retinopathy",
            color: "text-red-600",
            subtitle: "Extensive changes present. Urgent ophthalmologic consultation recommended."
          };
          case 4: return {
            title: "🚨 Proliferative diabetic retinopathy",
            color: "text-red-700",
            subtitle: "Advanced stage with new vessel growth. Immediate treatment required."
          };
          default: return {
            title: "Unknown Grade",
            color: "text-gray-500",
            subtitle: "Analysis complete but grade is unknown."
          }
      }
  }
  
  const gradeInfoDisplay = topPredictionData 
    ? getGradeInformationDisplay(topPredictionData.level, topPredictionData.label)
    : null;


  return (
    <main className="flex-grow pt-24 pb-16 px-4 w-full relative z-10">
      {/* Header Section (Unchanged) */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 mb-4">
          AI-Powered DR Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload a retinal image and get instant diabetic retinopathy grade
          prediction with advanced AI analysis
        </p>
      </div>

      {/* Upload Form (Unchanged) */}
      <div className="max-w-4xl mx-auto mb-12">
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          id="upload-form"
          className="glass-effect p-8 rounded-2xl shadow-2xl card-hover"
        >
          {/* Drag & Drop Zone */}
          {/* ... (input and file handling unchanged) ... */}
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

      {/* --- NEW Result Section based on the provided template --- */}
      {topPredictionData && result && gradeInfoDisplay && (
        <>
        <div className="max-w-4xl mx-auto mb-8">
          <div className="p-8 rounded-2xl shadow-2xl bg-white border border-gray-200"> {/* Replaced 'result-card' class */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-teal-700 mb-2">📊 Analysis Results</h2>
              <p className="text-gray-600">AI-powered diabetic retinopathy detection completed</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Grade Result */}
              <div className="text-center">
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100"> {/* Added bg-gray-50 for subtle contrast */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detected Grade</h3>
                  <div className={`text-4xl font-bold ${topPredictionData.gradeInfo.color} mb-2`}>
                    {topPredictionData.gradeInfo.label}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Confidence: <span className="font-semibold text-teal-600">
                      {(topPredictionData.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Severity Indicator */}
                  <div className="relative pt-1 mt-4">
                    {/* Severity Bar (Mimicking the image's gradient with colored segments) */}
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-green-500"></div>
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-yellow-400"></div>
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-orange-500"></div>
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-red-600"></div>
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-red-700"></div>
                    </div>
                    {/* Severity Marker */}
                    <div
                      className="absolute top-0 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full shadow-lg border-2 border-white"
                      style={{ left: markerPosition, top: '4px' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>No DR</span>
                    <span>Mild</span>
                    <span>Mod.</span>
                    <span>Sev.</span>
                    <span>PDR</span>
                  </div>
                </div>
              </div>

              {/* Grade Information */}
              <div>
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 h-full"> {/* Added h-full to match height */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Information</h3>
                  
                  <div className={gradeInfoDisplay.color}>
                    <p className="font-semibold text-lg flex items-center mb-1">
                      {gradeInfoDisplay.title}
                    </p>
                    <p className="text-sm mt-2 text-gray-700">
                      {gradeInfoDisplay.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Confidence Chart (Kept for rich data) */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-teal-700 mb-4">
                Detailed Prediction Distribution
              </h3>
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
                    title: { display: false },
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          max: 100,
                          title: { display: true, text: 'Confidence (%)' }
                      }
                  }
                }}
              />
            </div>

            {/* Heatmap (Kept for completeness) */}
            {result.heatmap && (
              <div className="mt-6 border-t pt-4 border-gray-200">
                <h3 className="font-semibold text-teal-600 mb-2">Heatmap Visualization</h3>
                <p className="text-sm text-gray-600 mb-2">
                      Areas of high importance are highlighted.
                </p>
                <img
                  src={result.heatmap}
                  alt="Grad-CAM Heatmap"
                  className="w-full rounded-lg shadow-md border"
                />
              </div>
            )}
          </div>
        </div>



{preview && (          
  <div className="max-w-4xl mx-auto mb-8">
    <div className="bg-white p-8 rounded-2xl shadow-xl card-hover">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        👁️ Original Retinal Image
      </h3>
      <div className="text-center">
        <div className="inline-block relative">
          <img id="original-image" src={preview} alt="Original Retinal Image" className="max-w-full max-h-80 h-auto rounded-lg shadow-lg border-4 border-teal-100" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-teal-600/10 rounded-lg" />
        </div>
        <p className="text-gray-600 mt-4 text-sm">
          The retinal image analyzed by our AI system
        </p>
      </div>
    </div>
  </div>
  )}

  <div className="max-w-4xl mx-auto mb-8">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl card-hover border border-blue-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        💡 Recommendations
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">👨‍⚕️</div>
            <div>
              <p className="font-semibold text-gray-800">Consult Your Doctor</p>
              <p className="text-gray-600 text-sm">Share these results with your healthcare provider for proper evaluation and treatment planning.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">📅</div>
            <div>
              <p className="font-semibold text-gray-800">Regular Monitoring</p>
              <p className="text-gray-600 text-sm">Schedule regular eye exams as recommended by your ophthalmologist.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🩺</div>
            <div>
              <p className="font-semibold text-gray-800">Blood Sugar Control</p>
              <p className="text-gray-600 text-sm">Maintain optimal blood glucose levels to prevent progression of diabetic retinopathy.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🏥</div>
            <div>
              <p className="font-semibold text-gray-800">Emergency Care</p>
              <p className="text-gray-600 text-sm">Seek immediate medical attention if you experience sudden vision changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="max-w-4xl mx-auto mb-8">
    <div className="bg-gray-50 p-8 rounded-2xl shadow-xl card-hover">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        🔬 Technical Analysis Details
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800 mb-2">AI Model</h4>
          <p className="text-gray-600 text-sm">Deep learning model trained on thousands of retinal images with self-attention mechanism</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800 mb-2">Image Processing</h4>
          <p className="text-gray-600 text-sm">Advanced preprocessing including vessel suppression and lesion decomposition</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-800 mb-2">Accuracy</h4>
          <p className="text-gray-600 text-sm">Validated on clinical datasets with &gt;75% accuracy across all DR grades</p>
        </div>
      </div>
    </div>
  </div>


</>

      )}
      {/* End of NEW Result Section */}
    </main>
  );
}