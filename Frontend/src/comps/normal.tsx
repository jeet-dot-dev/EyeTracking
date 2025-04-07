// import React, { useEffect, useRef, useState } from 'react';
// import * as faceapi from 'face-api.js';

// const videoHeight = 480;
// const videoWidth = 640;

// const App: React.FC = () => {
//   const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
//   const [captureVideo, setCaptureVideo] = useState<boolean>(false);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const loadModels = async () => {
      

//       try {
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
//           faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//           faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//           faceapi.nets.faceExpressionNet.loadFromUri('/models'),
//         ]);
        
//         setModelsLoaded(true);
//       } catch (error) {
//         console.error('Model loading failed:', error);
//       }
//     };

//     loadModels();
//   }, []);

//   const startVideo = () => {
//     setCaptureVideo(true);
//     navigator.mediaDevices
//       .getUserMedia({ video: { width: 300 } })
//       .then((stream) => {
//         const video = videoRef.current;
//         if (video) {
//           video.srcObject = stream;
//           video.play();
//         }
//       })
//       .catch((err) => {
//         console.error('Error starting video:', err);
//       });
//   };

//   const handleVideoOnPlay = () => {
//     setInterval(async () => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (video && canvas) {
//         canvas.innerHTML = '';
//         const displaySize = { width: videoWidth, height: videoHeight };
//         faceapi.matchDimensions(canvas, displaySize);

//         const detections = await faceapi
//           .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//           .withFaceLandmarks()
//           .withFaceExpressions();

//         const resizedDetections = faceapi.resizeResults(detections, displaySize);

//         const context = canvas.getContext('2d');
//         if (context) {
//           context.clearRect(0, 0, videoWidth, videoHeight);
//         }

//         faceapi.draw.drawDetections(canvas, resizedDetections);
//         faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
//         faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
//       }
//     }, 100);
//   };

//   const closeWebcam = () => {
//     const video = videoRef.current;
//     if (video && video.srcObject) {
//       const stream = video.srcObject as MediaStream;
//       stream.getTracks().forEach((track) => track.stop());
//       video.pause();
//     }
//     setCaptureVideo(false);
//   };

//   return (
//     <div>
//       <div style={{ textAlign: 'center', padding: '10px' }}>
//         {captureVideo && modelsLoaded ? (
//           <button
//             onClick={closeWebcam}
//             style={{
//               cursor: 'pointer',
//               backgroundColor: 'green',
//               color: 'white',
//               padding: '15px',
//               fontSize: '25px',
//               border: 'none',
//               borderRadius: '10px',
//             }}
//           >
//             Close Webcam
//           </button>
//         ) : (
//           <button
//             onClick={startVideo}
//             style={{
//               cursor: 'pointer',
//               backgroundColor: 'green',
//               color: 'white',
//               padding: '15px',
//               fontSize: '25px',
//               border: 'none',
//               borderRadius: '10px',
//             }}
//           >
//             Open Webcam
//           </button>
//         )}
//       </div>

//       {captureVideo ? (
//         modelsLoaded ? (
//           <div>
//             <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
//               <video
//                 ref={videoRef}
//                 height={videoHeight}
//                 width={videoWidth}
//                 onPlay={handleVideoOnPlay}
//                 style={{ borderRadius: '10px' }}
//               />
//               <canvas
//                 ref={canvasRef}
//                 style={{ position: 'absolute' }}
//               />
//             </div>
//           </div>
//         ) : (
//           <div>Loading models...</div>
//         )
//       ) : null}
//     </div>
//   );
// };

// export default App;

// First, set up your React project with TypeScript
// npx create-react-app cheating-detection --template typescript
// npm install tailwindcss framer-motion @radix-ui/react-toast
// npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection

// src/App.tsx

// First, set up your React project with TypeScript
// npx create-react-app cheating-detection --template typescript
// npm install tailwindcss framer-motion sonner
// npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection

// src/App.tsx