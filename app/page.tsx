import { BlogPosts } from 'app/components/posts'
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import("./components/ModelViewer"), {
  ssr: false, // disable server-side rendering
});

export default function Page() {
  return (
    <>
    
<div>
  {/* Hero Section */}
  <section id="hero" className="relative pt-32 pb-20 bg-pattern">
    <div className="max-w-6xl mx-auto text-center px-4 hero-animation">
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-xs font-medium">
          <span className="pulse-dot w-1.5 h-1.5 bg-teal-600 rounded-full" />
          AI-Powered Medical Diagnosis
        </span>
      </div>
<h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-4 leading-tight">
  Detect Diabetic<br />Retinopathy
  <span className="text-3xl md:text-5xl block mt-2">in Seconds</span>
</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
        Revolutionary AI technology that analyzes retinal images with 
        <span className="font-bold text-teal-600">more than 85% accuracy</span> to detect diabetic retinopathy,
        helping prevent vision loss through early intervention.
      </p>
      {/* Import the component */}
      <style dangerouslySetInnerHTML={{__html: "\n        model-viewer {\n            width: 400px;\n            height: 400px;\n        }\n    " }} />
      <center>
        {/* <model-viewer alt="Realistic Human Eye" src="static/models/realistic_human_eye.html" shadow-intensity={0} camera-controls animation-mixer autoPlay>
        </model-viewer> */}
        <ModelViewer />
      </center>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
        <a href="index.html" className="cta-button text-white py-3 px-6 rounded-full shadow-lg font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-xl">
          🚀 Start Free Analysis
        </a>
        <a href="dr_info.html" className="bg-white text-teal-600 py-3 px-6 rounded-full shadow-lg font-semibold text-base border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 btn-hover-effect">
          📚 Learn About DR
        </a>
      </div>
      {/* 3D Human Eye Model - Moved to Hero Section */}
      {/*      <div class="sketchfab-embed-wrapper mx-auto max-w-2xl"> */}
      {/*        <iframe title="Human Eye (animated, photorealistic textures)" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/6adbd6538cd146d484c9ad950be69aa5/embed"> </iframe> */}
      {/*        <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> */}
      {/*          <a href="https://sketchfab.com/3d-models/human-eye-animated-photorealistic-textures-6adbd6538cd146d484c9ad950be69aa5?utm_medium=embed&utm_campaign=share-popup&utm_content=6adbd6538cd146d484c9ad950be69aa5" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> Human Eye (animated, photorealistic textures) </a> by <a href="https://sketchfab.com/docgfx?utm_medium=embed&utm_campaign=share-popup&utm_content=6adbd6538cd146d484c9ad950be69aa5" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> docgfx </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=6adbd6538cd146d484c9ad950be69aa5" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a>*/}
      {/*        </p>*/}
      {/*      </div>*/}
    </div>
  </section>
  {/* Features Section */}
  <section id="features" className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Why Choose DR-Check AI?</h2>
        <p className="text-lg text-gray-600">Advanced AI technology meets clinical excellence</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">Lightning Fast Analysis</h3>
          <p className="text-gray-600 text-sm mb-3">Get results in under 3 seconds with our optimized deep learning models trained on millions of retinal images.</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• MobileNetV3 architecture</li>
            <li>• Real-time processing</li>
            <li>• Cloud-based inference</li>
          </ul>
        </div>
        <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">High Accuracy &amp; Reliability</h3>
          <p className="text-gray-600 text-sm mb-3">Our AI models are rigorously tested and validated, achieving over 85% accuracy in detecting various stages of DR.</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Clinically validated algorithms</li>
            <li>• Continuous model improvement</li>
            <li>• Reduced false positives</li>
          </ul>
        </div>
        <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12l-4.408 3.592A2 2 0 0118 16a2 2 0 01-2 2H6a2 2 0 01-2-2 2 2 0 01-.592-1L3 12l4.408-3.592A2 2 0 016 8a2 2 0 012-2h4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">User-Friendly Interface</h3>
          <p className="text-gray-600 text-sm mb-3">Designed for ease of use, our platform allows anyone to upload images and understand results without medical expertise.</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Intuitive drag-and-drop</li>
            <li>• Clear visual feedback</li>
            <li>• Multi-device compatibility</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  {/* How It Works Section */}
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
        <p className="text-lg text-gray-600">Simple, fast, and reliable DR detection in three steps</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="timeline-item">
          <div className="timeline-dot" />
          <div className="bg-teal-50 p-5 rounded-lg">
            <div className="text-2xl mb-3">📤</div>
            <h3 className="text-lg font-bold mb-2">Upload Image</h3>
            <p className="text-gray-600 text-sm">Upload your retinal photograph using our secure, drag-and-drop interface. We support all major image formats.</p>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot" />
          <div className="bg-blue-50 p-5 rounded-lg">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-600 text-sm">Our advanced neural network analyzes the image, identifying key features and patterns associated with diabetic retinopathy.</p>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot" />
          <div className="bg-emerald-50 p-5 rounded-lg">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-2">Get Results</h3>
            <p className="text-gray-600 text-sm">Receive detailed analysis with confidence scores, DR grade classification, and clinical recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* About DR Section */}
  <section id="about" className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Understanding Diabetic Retinopathy</h2>
          <p className="text-base text-gray-600 mb-4 leading-relaxed">
            Diabetic retinopathy is a serious eye condition that affects people with diabetes. It occurs when high blood sugar levels damage the tiny blood vessels in the retina, potentially leading to vision loss or blindness if left untreated.
          </p>
          <p className="text-base text-gray-600 mb-6 leading-relaxed">
            Early detection is crucial because diabetic retinopathy often has no symptoms in its initial stages. Regular screening can help identify the condition before it progresses to sight-threatening stages.
          </p>
          <a href="dr_info.html" className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-teal-700 transition-colors text-sm btn-hover-effect">
            Learn More About DR
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div className="relative">
          <div className="bg-white p-6 rounded-xl shadow-xl dr-stats-card"> {/* Added dr-stats-card class */}
            <h3 className="text-lg font-bold mb-4 text-gray-800">DR Prevalence Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Global diabetic population</span>
                <span className="font-bold text-teal-600">537M+</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">At risk for DR</span>
                <span className="font-bold text-teal-600">35%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Preventable blindness</span>
                <span className="font-bold text-teal-600">90%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-teal-600">Early detection success</span>
                <span className="font-bold text-teal-600">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* CTA Section */}
  <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
    <div className="max-w-4xl mx-auto text-center px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-5">Ready to Protect Your Vision?</h2>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="index.html" className="bg-white text-teal-600 py-2 px-5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg hover:text-teal-700 btn-hover-effect">
          🚀 Start Free Analysis
        </a>
        <a href="dr_info.html" className="border-2 border-white text-white py-2 px-5 rounded-full font-bold text-sm hover:bg-white hover:text-teal-600 transition-colors btn-hover-effect">
          📚 Learn More
        </a>
      </div>
    </div>
  </section>
</div>

    
    </>
  )
}
