'use client';

import { BrowserMultiFormatReader } from '@zxing/library';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

export default function BarcodeScanner({ onScan, isLoading }: BarcodeScannerProps) {
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [frozenImageData, setFrozenImageData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input.trim());
      setInput('');
    }
  };

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearTimeout(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    setIsScanning(false);
    setShowCamera(false);
    setScanError(null);
    setIsPaused(false);
    setFrozenImageData(null);
  }, []);

  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
    } catch (error) {
      console.error('Error getting cameras:', error);
    }
  }, []);

  const switchCamera = useCallback(() => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      if (isScanning) {
        stopScanning();
        setTimeout(() => startScanning(), 100);
      }
    }
  }, [cameras.length, currentCameraIndex, isScanning, stopScanning]);

  const startScanning = useCallback(async () => {
    try {
      setScanError(null);
      setShowCamera(true);

      await getCameras();

      let stream;
      const currentCamera = cameras[currentCameraIndex];

      try {
        const videoConstraints: MediaTrackConstraints = currentCamera
          ? { deviceId: { exact: currentCamera.deviceId } }
          : { facingMode: 'environment' };

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true);

          if (!readerRef.current) {
            readerRef.current = new BrowserMultiFormatReader();
          }
          
           const scanFrame = async () => {
             if (!videoRef.current || !readerRef.current || isPaused) return;
             
             try {
               const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
               if (result && result.getText()) {
                 onScan(result.getText());
                 stopScanning();
                 return;
               }
             } catch {
             }

             if (isScanning && !isPaused) {
               scanIntervalRef.current = setTimeout(scanFrame, 50);
             }
           };

          scanFrame();
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setScanError('Camera access denied. Please allow camera permissions.');
      setShowCamera(false);
    }
  }, [onScan, isScanning, stopScanning, getCameras, cameras, currentCameraIndex, isPaused]);

  const scanBarcodeFromImage = useCallback(async (imageFile: File): Promise<void> => {
    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(URL.createObjectURL(imageFile));
      onScan(result.getText());
    } catch {
      throw new Error('No barcode detected in image.');
    }
  }, [onScan]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileToScan = file;

    if (file.name.toLowerCase().endsWith('.heic')) {
      try {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
        fileToScan = new File([Array.isArray(blob) ? blob[0] : blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch {
        return;
      }
    }

    try {
      await scanBarcodeFromImage(fileToScan);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'No barcode detected. Please try again with a clearer image.');
    }
  }, [scanBarcodeFromImage]);

  const togglePausePlay = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (isPaused) {
      setIsPaused(false);
      setFrozenImageData(null);
      setScanError(null);

      if (isScanning && readerRef.current) {
        const scanFrame = async () => {
          if (!videoRef.current || !readerRef.current || isPaused) return;
          
          try {
            const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
            if (result && result.getText()) {
              onScan(result.getText());
              stopScanning();
              return;
            }
          } catch {
          }

          if (isScanning && !isPaused) {
            scanIntervalRef.current = setTimeout(scanFrame, 50);
          }
        };
        scanFrame();
      }
    } else {
      setIsPaused(true);
      if (scanIntervalRef.current) {
        clearTimeout(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frozenDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setFrozenImageData(frozenDataUrl);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

        try {
          await scanBarcodeFromImage(capturedFile);
        } catch (error) {
          setScanError(error instanceof Error ? error.message : 'No barcode detected in captured image. Try resuming to capture again.');
        }
      }, 'image/jpeg', 0.8);
    }
  }, [isPaused, isScanning, scanBarcodeFromImage, stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="govuk-!-margin-top-6" style={{ maxWidth: '100%' }}>
      {showCamera && (
        <div className="govuk-!-margin-bottom-4">
          <div style={{ position: 'relative', backgroundColor: '#000000', borderRadius: '8px', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                display: isPaused ? 'none' : 'block'
              }}
              playsInline
              muted
              autoPlay
            />

            {isPaused && frozenImageData && (
              <img
                src={frozenImageData}
                alt="Frozen"
                style={{ width: '100%', height: '320px', objectFit: 'cover' }}
              />
            )}

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{
                width: '192px',
                height: '192px',
                border: '2px dashed',
                borderColor: isPaused ? '#ffdd00' : '#ffffff',
                borderRadius: '8px',
                opacity: isPaused ? 0.7 : 0.5,
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '24px', height: '24px', borderTop: '4px solid', borderLeft: '4px solid', borderColor: isPaused ? '#ffdd00' : '#ffffff', borderTopLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '24px', height: '24px', borderTop: '4px solid', borderRight: '4px solid', borderColor: isPaused ? '#ffdd00' : '#ffffff', borderTopRightRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '24px', height: '24px', borderBottom: '4px solid', borderLeft: '4px solid', borderColor: isPaused ? '#ffdd00' : '#ffffff', borderBottomLeftRadius: '8px' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderBottom: '4px solid', borderRight: '4px solid', borderColor: isPaused ? '#ffdd00' : '#ffffff', borderBottomRightRadius: '8px' }}></div>
              </div>
            </div>

            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
              <button
                onClick={togglePausePlay}
                className={`govuk-button ${isPaused ? 'govuk-button--warning' : 'govuk-button--secondary'}`}
                style={{ marginBottom: 0, minWidth: 'auto', padding: '8px 12px', backgroundColor: isPaused ? '#ffdd00' : 'rgba(0, 0, 0, 0.5)', color: isPaused ? '#0b0c0c' : '#ffffff', fontSize: '0.875rem', fontWeight: 'bold' }}
                title={isPaused ? "Resume Scanning" : "Pause & Capture"}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              {cameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="govuk-button govuk-button--secondary"
                  style={{ marginBottom: 0, minWidth: 'auto', padding: '8px 12px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff', fontSize: '0.875rem', fontWeight: 'bold' }}
                  title="Switch Camera"
                >
                  Switch
                </button>
              )}
              <button
                onClick={stopScanning}
                className="govuk-button govuk-button--secondary"
                style={{ marginBottom: 0, minWidth: 'auto', padding: '8px 12px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff', fontSize: '0.875rem', fontWeight: 'bold' }}
                title="Close Camera"
              >
                Close
              </button>
            </div>
          </div>

          <div className={isPaused ? 'govuk-warning-text' : 'govuk-inset-text'} style={{
            padding: '12px',
            textAlign: 'center',
            backgroundColor: isPaused ? '#ffdd00' : '#1d70b8',
            color: isPaused ? '#0b0c0c' : '#ffffff',
            marginBottom: 0
          }}>
            {isPaused ? (
              <p className="govuk-body-s" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 0, color: '#0b0c0c' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#0b0c0c', borderRadius: '50%', display: 'inline-block' }}></span>
                Paused
              </p>
            ) : isScanning ? (
              <p className="govuk-body-s" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 0, color: '#ffffff' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#00703c', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                Scanning...
              </p>
            ) : (
              <p className="govuk-body-s" style={{ marginBottom: 0, color: '#ffffff' }}>Initializing camera...</p>
            )}
          </div>
        </div>
      )}

      {scanError && (
        <div className="govuk-error-message" style={{ padding: '15px', backgroundColor: '#fff5f5', border: '2px solid #d4351c', marginBottom: '20px' }}>
          <span className="govuk-visually-hidden">Error:</span> {scanError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="govuk-form-group">
        <label htmlFor="gtin-input" className="govuk-label">
          Enter GTIN or scan a barcode
        </label>
        <input
          id="gtin-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="govuk-input"
        />

        <div className="govuk-button-group govuk-!-margin-top-4">
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isScanning}
            className="govuk-button"
            data-module="govuk-button"
          >
            Search
          </button>

          <button
            type="button"
            onClick={isScanning ? stopScanning : startScanning}
            disabled={isLoading}
            className={`govuk-button ${isScanning ? 'govuk-button--warning' : 'govuk-button--secondary'}`}
            data-module="govuk-button"
          >
            {isScanning ? 'Stop Camera' : 'Scan Barcode'}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isScanning}
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            Upload Image
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </form>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}