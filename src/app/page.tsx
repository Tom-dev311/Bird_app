"use client";

import { useState, useRef } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

type Bird = {
  photo: string;
  type: string;
  nickname: string;
};

export default function Home() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = () => {
    setIsCameraActive(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) {  
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }).catch (error => {
      console.error("Error accessing the camera:", error);
    })
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        // Set canvas size to match video dimensions
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the video frame onto the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert the canvas content to a Base64 image
        const photoData = canvas.toDataURL("image/png");
        setCapturedPhoto(photoData); // Save the captured photo for display
        return photoData;
      }
    }
    return null;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const birdType = formData.get("type") as string;
    const birdNickname = formData.get("nickname") as string;

    if (!capturedPhoto || !birdType || !birdNickname) {
      alert("Please provide all the required details.");
      return;
    }

    const newBird: Bird = {
      photo: capturedPhoto,
      type: birdType,
      nickname: birdNickname,
    };

    setBirds((prevBirds) => [...prevBirds, newBird]);
    setIsCameraActive(false);
    setCapturedPhoto(null);
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center text-gray-800 p-8"
      style={{ backgroundImage: "url('/download.jpg')" }}
    >
      <SignedOut>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-extrabold text-blue-700">
            Welcome to the Bird App
          </h1>
          <div className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700 transition">
            <SignInButton mode="modal" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="w-full max-w-3xl">
          <header className="flex justify-between items-center bg-white shadow p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-blue-700">Bird Application</h1>
            <UserButton />
          </header>

          {!isCameraActive && (
            <div className="flex justify-center mt-8">
              <button
                onClick={startCamera}
                className="text-white bg-green-500 px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition transform hover:scale-105"
              >
                Start Camera
              </button>
            </div>
          )}

          {isCameraActive && (
            <div className="flex flex-col gap-6 mt-8 bg-white p-6 rounded-lg shadow">
              <video ref={videoRef} className="w-full max-h-64 rounded border" />
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {capturedPhoto && (
                <Image
                src={capturedPhoto}
                alt="Captured Bird"
                width={640}
                height={480}
                className="rounded"
                priority
                />
              )}

              <button
                onClick={takePhoto}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Capture Photo
              </button>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col">
                  Type of Bird:
                  <input
                    type="text"
                    name="type"
                    placeholder="E.g., Sparrow"
                    required
                    className="mt-2 px-3 py-2 border rounded focus:ring focus:ring-blue-200"
                  />
                </label>
                <label className="flex flex-col">
                  Nickname:
                  <input
                    type="text"
                    name="nickname"
                    placeholder="E.g., Chirpy"
                    required
                    className="mt-2 px-3 py-2 border rounded focus:ring focus:ring-blue-200"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition transform hover:scale-105"
                >
                  Save Bird
                </button>
              </form>
            </div>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Saved Birds</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {birds.map((bird, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center text-center"
                >
                  <Image
                    src={bird.photo}
                    alt={`Bird - ${bird.type}`}
                    width={96}
                    height={96}
                    className="object-cover rounded-full border-4 border-blue-500 mb-4"
                  />
                  <div>
                    <p className="text-lg font-bold text-gray-700">{bird.type}</p>
                    <p className="text-sm text-gray-500 italic">{bird.nickname}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </SignedIn>
    </div>
  );
}
