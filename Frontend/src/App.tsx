
import  { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { Toaster, toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const App: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isWebcamRunning, setIsWebcamRunning] = useState<boolean>(false);
  const [cheatingProbability, setCheatingProbability] = useState<number>(0);
  const [lookingAway, setLookingAway] = useState<boolean>(false);
  const [lookingAwayCount, setLookingAwayCount] = useState<number>(0);
  const [modelLoadingProgress, setModelLoadingProgress] = useState<number>(0);
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      
      try {
        // Simulate progressive loading for demo purposes
        setModelLoadingProgress(10);
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelLoadingProgress(40);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setModelLoadingProgress(70);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelLoadingProgress(90);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelLoadingProgress(100);
        
        setIsModelLoaded(true);
        toast.success("Models loaded", {
          description: "Face detection models have been loaded successfully."
        });
      } catch (error) {
        console.error('Failed to load models:', error);
        toast.error("Error", {
          description: "Failed to load face detection models."
        });
      }
    };

    loadModels();
  }, []);

  // Start webcam
  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && webcamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setIsWebcamRunning(true);
          toast.success("Webcam started", {
            description: "Monitoring has begun. Keep your eyes on the screen."
          });
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        toast.error("Webcam error", {
          description: "Could not access your webcam. Please check permissions."
        });
      }
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = (webcamRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      setIsWebcamRunning(false);
      toast.info("Monitoring stopped", {
        description: "Webcam has been turned off."
      });
    }
  };

  // Detect face and eye movements
  useEffect(() => {
    let frameId: number;
    let consecutiveAwayFrames = 0;
    const AWAY_THRESHOLD = 5; // Number of consecutive frames to confirm looking away
    
    const detectEyeMovement = async () => {
      if (!isWebcamRunning || !webcamRef.current || !canvasRef.current || !isModelLoaded) return;
      
      // Get canvas context
      const videoWidth = webcamRef.current.videoWidth;
      const videoHeight = webcamRef.current.videoHeight;
      
      webcamRef.current.width = videoWidth;
      webcamRef.current.height = videoHeight;
      
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Detect faces
      const detections = await faceapi.detectAllFaces(
        webcamRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();
      
      // Clear canvas
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      
      // Draw results
      if (detections.length > 0) {
        // Draw face landmarks
        faceapi.draw.drawDetections(canvasRef.current, detections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);

        
        
        // Get first detected face
        const face = detections[0];
        //  console.log(face)
        const landmarks = face.landmarks;
        const jawOutline = landmarks.getJawOutline();
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Calculate eye positions and direction
        const leftEyeCenter = calculateCenterPoint(leftEye);
        const rightEyeCenter = calculateCenterPoint(rightEye);
        const noseTop = nose[0];

        //console.log(leftEyeCenter);
        
        // Calculate head pose (simplified)
        const faceDirection = calculateFaceDirection(jawOutline, leftEyeCenter, rightEyeCenter, noseTop);
        
        // Determine if looking away from screen
        const isLookingAway = Math.abs(faceDirection.x) > 0.1 || Math.abs(faceDirection.y) > 0.1;
        
        if (isLookingAway) {
          consecutiveAwayFrames++;
          if (consecutiveAwayFrames >= AWAY_THRESHOLD && !lookingAway) {
            setLookingAway(true);
            setLookingAwayCount(prev => prev + 1);
            
            // Calculate cheating probability based on how many times looked away
            const newProbability = Math.min(100, lookingAwayCount * 20);
            setCheatingProbability(newProbability);
            
            // Show alert for looking away
            toast.error("Potential cheating detected!", {
              description: `You appear to be looking away from the screen. Probability: ${newProbability}%`
            });
          }
        } else {
          consecutiveAwayFrames = 0;
          if (lookingAway) {
            setLookingAway(false);
          }
        }
      } else {
        // No face detected
        consecutiveAwayFrames++;
        if (consecutiveAwayFrames >= AWAY_THRESHOLD * 2 && !lookingAway) {
          setLookingAway(true);
          setLookingAwayCount(prev => prev + 1);
          
          const newProbability = Math.min(100, lookingAwayCount * 25);
          setCheatingProbability(newProbability);
          
          toast.error("Face not detected!", {
            description: "Please ensure your face is visible to the camera."
          });
        }
      }
      
      frameId = requestAnimationFrame(detectEyeMovement);
    };
    
    if (isWebcamRunning && isModelLoaded) {
      frameId = requestAnimationFrame(detectEyeMovement);
    }
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isWebcamRunning, isModelLoaded, lookingAway, lookingAwayCount]);
  
  // Helper functions
  const calculateCenterPoint = (points: faceapi.Point[]) => {
    const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  };
  
  const calculateFaceDirection = (
    jawOutline: faceapi.Point[], 
    leftEye: { x: number, y: number }, 
    rightEye: { x: number, y: number },
    noseTop: faceapi.Point
  ) => {
    // Center of face (approximation)
    const faceCenter = calculateCenterPoint(jawOutline);
    
    // Eye line midpoint
    const eyeMidpoint = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };
    
    // Calculate direction vectors
    const xDirection = (eyeMidpoint.x - faceCenter.x) / (jawOutline[16].x - jawOutline[0].x);
    const yDirection = (noseTop.y - eyeMidpoint.y) / (jawOutline[8].y - eyeMidpoint.y);
    console.log(xDirection,yDirection);
    return { x: xDirection, y: yDirection };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Exam Cheating Detection</CardTitle>
          <CardDescription className="text-center">
            Real-time monitoring system for online exams
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isModelLoaded ? (
            <div className="space-y-4 p-4">
              <h3 className="text-lg font-medium">Loading face detection models...</h3>
              <Progress value={modelLoadingProgress} className="w-full" />
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-md">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <video
                  ref={webcamRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full border rounded-md"
                  onPlay={() => setIsWebcamRunning(true)}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full z-10"
                />
              </motion.div>
              
              {lookingAway && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center"
                >
                  <span className="text-white font-bold text-xl p-2 bg-red-600 rounded">
                    Looking Away Detected!
                  </span>
                </motion.div>
              )}
            </div>
          )}
          
          {isModelLoaded && (
            <div className="mt-4 space-y-4">
              <Alert variant={cheatingProbability > 50 ? "destructive" : "default"}>
                <AlertTitle>Cheating Probability</AlertTitle>
                <AlertDescription className="flex items-center">
                  <Progress 
                    value={cheatingProbability} 
                    className="flex-1 mr-2" 
                  />
                  <span className="font-bold">{cheatingProbability}%</span>
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium">Looking away count</p>
                  <p className="text-2xl font-bold">{lookingAwayCount}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium">Status</p>
                  <p className={`text-lg font-bold ${lookingAway ? 'text-red-500' : 'text-green-500'}`}>
                    {lookingAway ? 'Warning' : 'Normal'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={isWebcamRunning ? stopWebcam : startWebcam}
            disabled={!isModelLoaded}
          >
            {isWebcamRunning ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          
          <Button 
            variant="destructive"
            disabled={cheatingProbability === 0}
            onClick={() => {
              setCheatingProbability(0);
              setLookingAwayCount(0);
              setLookingAway(false);
            }}
          >
            Reset Warnings
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
};

export default App;