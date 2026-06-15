import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

function CameraCapture() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    loadModel();

    return () => {
      clearInterval(window.detectLoop);
    };
  }, []);

  const loadModel = async () => {
    await tf.setBackend("webgl");
    await tf.ready();

    modelRef.current = await handpose.load();

    window.detectLoop = setInterval(detectHands, 100);
  };

  const detectHands = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;

      const predictions =
        await modelRef.current.estimateHands(video);

      drawHand(predictions);
    }
  };

  const drawHand = (hands) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = webcamRef.current.video.videoWidth;
    canvas.height = webcamRef.current.video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hands.forEach((hand) => {
      const xs = hand.landmarks.map((p) => p[0]);
      const ys = hand.landmarks.map((p) => p[1]);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);

      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";

      ctx.strokeRect(
        minX,
        minY,
        maxX - minX,
        maxY - minY
      );
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "640px",
      }}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        screenshotFormat="image/png"
        style={{
          width: "100%",
        }}
      />
  
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
}

export default CameraCapture;