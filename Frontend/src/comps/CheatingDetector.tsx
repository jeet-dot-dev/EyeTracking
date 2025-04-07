import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import { motion } from "framer-motion";

// Add webcam and model types
const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: "user",
};

const CheatingDetector: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [cheating, setCheating] = useState<boolean>(false);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);

  // Load BlazeFace model
  useEffect(() => {
    const loadModel = async () => {
      const m = await blazeface.load();
      setModel(m);
    };
    loadModel();
  }, []);

  // Face detection logic
  useEffect(() => {
    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        model
      ) {
        const video = webcamRef.current.video as HTMLVideoElement;
        const predictions = await model.estimateFaces(video, false);

        if (predictions.length > 0) {
          const face = predictions[0];
          const topLeft = face.topLeft as [number, number];
          const bottomRight = face.bottomRight as [number, number];
          const faceWidth = bottomRight[0] - topLeft[0];

          // If face is small or user turned away
          if (faceWidth < 80) {
            setCheating(true);
          } else {
            setCheating(false);
          }
        } else {
          setCheating(true); // No face = cheating
        }
      }
    };

    const interval = setInterval(detect, 1000);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center">
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={videoConstraints}
        style={{ width: 300, height: 300, borderRadius: 12 }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: cheating ? 1 : 0 }}
        className="absolute bottom-10 text-red-400 font-bold text-xl bg-red-900/50 px-6 py-2 rounded-xl shadow-lg"
      >
        Cheating Detected!
      </motion.div>
    </div>
  );
};

export default CheatingDetector;
