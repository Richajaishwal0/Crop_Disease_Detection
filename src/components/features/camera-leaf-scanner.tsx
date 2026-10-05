'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Upload,
  RefreshCw,
  SwitchCamera,
  Zap,
  ZapOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Focus,
  RotateCcw,
  Smartphone,
  Lock,
} from 'lucide-react';
import Image from 'next/image';

interface CameraLeafScannerProps {
  onImageSelected: (dataUri: string, file?: File) => void;
  isLoading?: boolean;
  selectedImage?: string | null;
  onReset?: () => void;
  className?: string;
}

export function CameraLeafScanner({
  onImageSelected,
  isLoading = false,
  selectedImage = null,
  onReset,
  className = '',
}: CameraLeafScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [isInsecureContext, setIsInsecureContext] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Detect HTTPS vs HTTP context on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';

      if (!isHttps && !isLocalhost) {
        setIsInsecureContext(true);
      }
    }
  }, []);

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Check available video devices
  useEffect(() => {
    async function checkDevices() {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        } catch {
          // Ignore permission/enumeration errors
        }
      }
    }
    checkDevices();
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const isHttp =
        typeof window !== 'undefined' &&
        window.location.protocol === 'http:' &&
        window.location.hostname !== 'localhost';
      if (isHttp) {
        setCameraError(
          'Mobile browsers require HTTPS to stream live video. Use the "Open Phone Camera" button below to take high-res leaf photos instantly.'
        );
      } else {
        setCameraError('Camera access is not supported on this browser or device.');
      }
      return;
    }

    setIsCameraStarting(true);
    setCameraError(null);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if torch/flashlight is supported
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as any;
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your phone/browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else {
        setCameraError('Unable to open live camera. Use the Phone Camera button below.');
      }
    } finally {
      setIsCameraStarting(false);
    }
  }, [facingMode, stream]);

  // Switch camera tab or active mode
  useEffect(() => {
    if (activeTab === 'camera' && !selectedImage && !stream) {
      startCamera();
    } else if (activeTab === 'upload' && stream) {
      stopCameraStream();
    }
  }, [activeTab, selectedImage, startCamera, stopCameraStream, stream]);

  // Ensure stream attaches to video tag when created
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Toggle between front and back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    stopCameraStream();
    setTimeout(() => {
      setFacingMode(nextMode);
    }, 50);
  };

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch toggling failed:', err);
      }
    }
  };

  // Convert Data URI to File object helper
  const dataUriToFile = (dataUri: string, filename = 'leaf-photo.jpg'): File => {
    const arr = dataUri.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Take photo snapshot from live stream
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const dataUri = canvas.toDataURL('image/jpeg', 0.92);
      const file = dataUriToFile(dataUri, `leaf-scan-${Date.now()}.jpg`);

      stopCameraStream();
      onImageSelected(dataUri, file);
    }
  };

  // Handle native phone camera snapshot (via HTML5 capture="environment")
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        onImageSelected(dataUri, file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle standard file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        onImageSelected(dataUri, file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Retake or reset
  const handleRetake = () => {
    if (onReset) {
      onReset();
    }
    setActiveTab('camera');
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Hidden canvas for snapshot rasterization */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden native mobile camera input */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeCameraCapture}
      />

      {/* Mode Switcher Header */}
      {!selectedImage && (
        <div className="flex items-center justify-center p-1 mb-4 bg-muted/80 rounded-lg border border-border max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === 'camera'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>
        </div>
      )}

      {/* Main Viewfinder / Canvas Box */}
      <div className="relative w-full aspect-video min-h-[320px] sm:min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border-2 border-border shadow-inner flex flex-col items-center justify-center">
        
        {/* State 1: Captured Image Preview */}
        {selectedImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/90 group">
            <Image
              src={selectedImage}
              alt="Leaf capture"
              fill
              className="object-contain p-2"
              priority
            />
            
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-md text-xs gap-1.5 border border-border shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Leaf Photo Ready
              </Badge>
            </div>

            {!isLoading && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center z-10">
                <Button
                  type="button"
                  onClick={handleRetake}
                  variant="secondary"
                  className="bg-background/90 hover:bg-background text-foreground shadow-lg backdrop-blur-sm border border-border gap-2 font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Photo
                </Button>
              </div>
            )}
          </div>
        ) : activeTab === 'camera' ? (
          /* State 2: Live Camera Viewfinder */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
            {cameraError ? (
              <div className="p-6 text-center max-w-md space-y-3 z-10">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                  {isInsecureContext ? <Lock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <h4 className="font-semibold text-slate-100 text-base">
                  {isInsecureContext ? 'Phone Camera Ready' : 'Camera Access'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">{cameraError}</p>

                {/* Primary Button for Phone: Native Phone Camera */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md gap-2 border-0"
                  >
                    <Smartphone className="h-4 w-4" />
                    Open Phone Camera
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload from Gallery
                  </Button>
                </div>
              </div>
            ) : isCameraStarting ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium">Connecting to Camera...</p>
              </div>
            ) : (
              <>
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Visual Shutter Flash Effect */}
                {isShutterFlashing && (
                  <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
                )}

                {/* Leaf Framing & Alignment Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 p-6">
                  <div className="relative w-full max-w-xs sm:max-w-sm aspect-square border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    <Focus className="w-10 h-10 text-emerald-400/60 animate-pulse" />

                    <div className="absolute -bottom-10 inset-x-0 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-emerald-300 text-xs font-medium backdrop-blur-md border border-emerald-500/30">
                        <Sparkles className="h-3.5 w-3.5" />
                        Position affected leaf inside frame
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camera Top Controls Bar */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10 text-xs flex items-center gap-1.5 px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono">LIVE FEED</span>
                  </Badge>

                  <div className="flex items-center gap-2">
                    {/* Quick Native Camera Option for high-res device camera */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="h-9 px-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md text-xs gap-1.5 hidden sm:flex"
                      title="Open Device Camera App"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                      Phone Camera
                    </Button>

                    {hasTorch && (
                      <Button
                        type="button"
                        size="icon"
                        onClick={toggleTorch}
                        className={`h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition-all ${
                          isTorchOn ? 'text-amber-400 bg-amber-500/20 border-amber-500/50' : ''
                        }`}
                        title="Toggle Flashlight"
                      >
                        {isTorchOn ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                      </Button>
                    )}

                    {hasMultipleCameras && (
                      <Button
                        type="button"
                        size="icon"
                        onClick={toggleFacingMode}
                        className="h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md"
                        title="Switch Camera (Front / Rear)"
                      >
                        <SwitchCamera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Camera Bottom Shutter Capture Bar */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center z-20 pointer-events-auto">
                  <div className="flex items-center gap-4">
                    {/* Shutter Button for WebRTC snapshot */}
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      disabled={isLoading}
                      className="group relative flex items-center justify-center p-1 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/60 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
                      aria-label="Capture Leaf Photo"
                    >
                      <div className="w-16 h-16 rounded-full bg-white group-hover:bg-emerald-400 group-active:bg-emerald-500 transition-colors flex items-center justify-center shadow-md">
                        <Camera className="h-7 w-7 text-slate-900 group-hover:text-slate-950 transition-colors" />
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* State 3: Upload from File Tab */
          <div
            className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-900/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-inner">
              <Upload className="h-8 w-8" />
            </div>
            <h4 className="font-semibold text-slate-100 text-base">Select or Drop Leaf Photo</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Upload a clear close-up image of the affected leaf (PNG, JPG, or WEBP up to 5MB)
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm"
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Quick Mobile Action Bar (Always visible below viewfinder) */}
      {!selectedImage && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => nativeCameraInputRef.current?.click()}
            className="text-xs gap-1.5 h-8 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Take Photo with Phone Camera App
          </Button>

          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Focus className="h-3.5 w-3.5 text-emerald-500" />
            Keep leaf in focus under clear light
          </span>
        </div>
      )}
    </div>
  );
}
