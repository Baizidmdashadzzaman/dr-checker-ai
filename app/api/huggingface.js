// api/huggingface.js
import { Client } from "@gradio/client";

let client = null;

/**
 * Connect once to Hugging Face Space
 */
export async function getClient() {
  if (!client) {
    client = await Client.connect("ashad0167/dr-check-ai"); // Change to your DR Space
  }
  return client;
}

/**
 * Predict DR grade from an image
 * @param {File | Blob} file
 * @returns {Object} { predictions: {label: confidence}, heatmap: URL }
 */
export async function predictDR(file) {
  if (!file) throw new Error("No file provided");

  const client = await getClient();

  const result = await client.predict("/predict", { image_path: file });

  // result.data[0] -> predictions (Gradio Label format)
  // result.data[1] -> Grad-CAM image (if any)
  const predData = result.data?.[0];
  const gradcamFile = result.data?.[1];

  const heatmapUrl = gradcamFile?.url || "";

  const predictions = {};
  if (predData?.confidences) {
    predData.confidences.forEach((c) => {
      predictions[c.label] = c.confidence;
    });
  }

  return { predictions, heatmap: heatmapUrl };
}
