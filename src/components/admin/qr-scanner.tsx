'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { checkInRegistrantAction } from '@/app/actions';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  UserCheck, 
  Volume2,
  CornerDownLeft,
  Loader2
} from 'lucide-react';

interface QRScannerProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: (registration: any) => void;
}

interface ScanHistoryItem {
  id: string;
  name: string;
  rollNo: string;
  timestamp: Date;
  status: 'success' | 'already' | 'error';
  message: string;
}

export function QRScanner({ eventId, isOpen, onClose, onCheckInSuccess }: QRScannerProps) {
  const [jsQrLoaded, setJsQrLoaded] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [scanning, setScanning] = useState(false);
  const [processingCode, setProcessingCode] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [manualId, setManualId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [lastScannedText, setLastScannedText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const { toast } = useToast();

  // 1. Load jsQR from CDN
  useEffect(() => {
    if (isOpen) {
      if ((window as any).jsQR) {
        setJsQrLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.async = true;
      script.onload = () => setJsQrLoaded(true);
      script.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Dependency Error',
          description: 'Failed to load QR scanner library. Please check your internet connection.'
        });
      };
      document.body.appendChild(script);
      return () => {
        // Keep it loaded for subsequent opens
      };
    }
  }, [isOpen, toast]);

  // 2. Start default camera and prompt for permission
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    try {
      setCameraPermission('unknown');
      
      let constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment' }
      };

      if (deviceId) {
        constraints = {
          video: { deviceId: { exact: deviceId } }
        };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("First camera constraint failed, falling back to basic video constraint...", firstErr);
        // Fallback: If deviceId exact failed or facingMode: 'environment' failed (like on laptop without rear camera)
        // try a generic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanning(true);
      }

      // After successful stream, enumerate devices to list other cameras (now that permission is granted)
      await enumerateCameras();
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraPermission('denied');
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please grant camera access in your browser settings to scan tickets.'
      });
    }
  };

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(videoInputs);
      
      // If we don't have an active device ID yet, try to match the active track
      if (streamRef.current && videoInputs.length > 0) {
        const activeTrack = streamRef.current.getVideoTracks()[0];
        const settings = activeTrack?.getSettings();
        if (settings && settings.deviceId) {
          setActiveDeviceId(settings.deviceId);
        } else {
          // Fallback to label matching or first device
          const activeLabel = activeTrack?.label;
          const matchingDevice = videoInputs.find(d => d.label === activeLabel);
          if (matchingDevice) {
            setActiveDeviceId(matchingDevice.deviceId);
          } else {
            // Find rear camera or first camera
            const backCamera = videoInputs.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
            );
            setActiveDeviceId(backCamera ? backCamera.deviceId : videoInputs[0].deviceId);
          }
        }
      }
    } catch (err) {
      console.error('Error enumerating cameras:', err);
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = () => {
    if (videoDevices.length <= 1) return;
    const currentIndex = videoDevices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];
    if (nextDevice) {
      setActiveDeviceId(nextDevice.deviceId);
      startCamera(nextDevice.deviceId);
    }
  };

  // 3. Manage Camera Lifecycle
  useEffect(() => {
    if (isOpen && jsQrLoaded) {
      // Start camera automatically with default settings (prompts for permission)
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, jsQrLoaded]);

  // 4. Decode loop
  useEffect(() => {
    if (scanning && jsQrLoaded) {
      const tick = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Draw small square frame or full video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (code && code.data && !processingCode) {
                // Prevent scanning same code repeatedly in short succession
                if (code.data !== lastScannedText) {
                  setLastScannedText(code.data);
                  handleQrCodeScanned(code.data);
                }
              }
            }
          }
        }
        if (scanning) {
          animationFrameId.current = requestAnimationFrame(tick);
        }
      };
      
      animationFrameId.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scanning, jsQrLoaded, processingCode, lastScannedText]);

  // Helper: Play friendly beep sound
  const playBeep = (type: 'success' | 'error' | 'warning') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'success') {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // high pitched A5
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'warning') {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // lower pitch A4
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.25);
      } else {
        // error: double descending buzz
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn('Audio beep could not play:', err);
    }
  };

  // 5. Handle Scanned Ticket Reference ID
  const handleQrCodeScanned = async (scannedId: string) => {
    const trimmedId = scannedId.trim();
    if (!trimmedId) return;

    // Soft-validate that it's a valid Firebase doc ID style or order ID
    if (trimmedId.length < 5) {
      return; // ignore noise
    }

    setProcessingCode(true);
    playBeep('success'); // instant feedback

    try {
      const result = await checkInRegistrantAction(eventId, trimmedId, true);
      
      if (result.error) {
        // Ticket is not valid or database write failed
        playBeep('error');
        const newItem: ScanHistoryItem = {
          id: trimmedId,
          name: 'Unknown Ticket',
          rollNo: 'N/A',
          timestamp: new Date(),
          status: 'error',
          message: result.error
        };
        setHistory(prev => [newItem, ...prev.slice(0, 4)]);
        toast({
          variant: 'destructive',
          title: 'Scan Failed',
          description: result.error
        });
      } else if (result.registration) {
        const reg = result.registration;
        const alreadyCheckedIn = reg.checkedIn && reg.checkedInAt && (new Date(reg.checkedInAt).getTime() < Date.now() - 5000);
        
        const newItem: ScanHistoryItem = {
          id: trimmedId,
          name: reg.name,
          rollNo: reg.rollNo || 'N/A',
          timestamp: new Date(),
          status: alreadyCheckedIn ? 'already' : 'success',
          message: alreadyCheckedIn ? 'Already checked in earlier!' : 'Successfully Checked In'
        };

        if (alreadyCheckedIn) {
          playBeep('warning');
        }

        setHistory(prev => [newItem, ...prev.slice(0, 4)]);
        onCheckInSuccess(reg);

        toast({
          variant: alreadyCheckedIn ? 'default' : 'success',
          title: alreadyCheckedIn ? 'Warning: Duplicate Scan' : 'Check-in Successful!',
          description: `${reg.name} (${reg.rollNo || 'No Roll'}) is now checked in.`
        });
      }
    } catch (err: any) {
      playBeep('error');
      console.error('Scan check-in error:', err);
    } finally {
      // Pause slightly so the admin sees the scanner success state and then clear
      setTimeout(() => {
        setProcessingCode(false);
      }, 1500);
      
      // Clear last scanned text after 3 seconds to allow re-scanning the same ticket if needed
      setTimeout(() => {
        setLastScannedText('');
      }, 3000);
    }
  };

  // 6. Manual Ticket Reference input fallback
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = manualId.trim();
    if (!trimmedId) return;

    setManualLoading(true);
    try {
      const result = await checkInRegistrantAction(eventId, trimmedId, true);
      if (result.error) {
        playBeep('error');
        toast({
          variant: 'destructive',
          title: 'Manual Check-In Failed',
          description: result.error
        });
      } else if (result.registration) {
        playBeep('success');
        const reg = result.registration;
        const newItem: ScanHistoryItem = {
          id: trimmedId,
          name: reg.name,
          rollNo: reg.rollNo || 'N/A',
          timestamp: new Date(),
          status: 'success',
          message: 'Manually Checked In'
        };
        setHistory(prev => [newItem, ...prev.slice(0, 4)]);
        onCheckInSuccess(reg);
        setManualId('');
        toast({
          title: 'Check-in Successful!',
          description: `${reg.name} (${reg.rollNo || 'No Roll'}) checked in manually.`
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.'
      });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white text-black border-4 border-black p-0 overflow-hidden max-h-[95vh] flex flex-col shadow-[10px_10px_0px_0px_#000000] rounded-none font-sans">
        <DialogHeader className="p-4 border-b-2 border-black bg-[#FFE600]">
          <DialogTitle className="text-black flex items-center gap-2 text-base font-black uppercase tracking-tight font-display">
            <Camera className="h-5 w-5 text-black stroke-[2.5]" />
            Live Ticket Scanner
          </DialogTitle>
          <DialogDescription className="text-black text-xs font-bold uppercase tracking-wider">
            Point camera at the attendee's ticket QR code.
          </DialogDescription>
        </DialogHeader>

        {/* Scanner Feed Viewport */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center border-b-2 border-black">
          {!jsQrLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-black bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
              <p className="text-xs font-black uppercase tracking-wider">Initializing scanning engine...</p>
            </div>
          )}

          {jsQrLoaded && cameraPermission === 'denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 bg-white text-black">
              <AlertCircle className="h-12 w-12 text-[#FF0055] stroke-[2.5]" />
              <div>
                <p className="font-black text-sm uppercase">Camera Permission Denied</p>
                <p className="text-xs text-zinc-600 font-bold mt-1">
                  Please enable camera access in your browser settings to scan QR tickets directly.
                </p>
              </div>
              <Button 
                onClick={() => startCamera(activeDeviceId)} 
                className="bg-[#FFE600] hover:bg-[#f5dc00] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] rounded-none"
              >
                Try Accessing Camera Again
              </Button>
            </div>
          )}

          {jsQrLoaded && cameraPermission !== 'denied' && (
            <>
              <video 
                ref={videoRef} 
                className="h-full w-full object-cover" 
                playsInline 
                muted 
              />
              <canvas ref={canvasRef} className="hidden" />

              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-black bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                  <p className="text-xs font-black uppercase tracking-wider">Connecting to camera...</p>
                </div>
              )}

              {/* Glowing Scan HUD Overlay */}
              <div className="absolute inset-0 border-[30px] border-black/60 pointer-events-none flex items-center justify-center">
                <div className={`w-64 h-64 border-2 rounded-none relative transition-all duration-300 ${
                  processingCode 
                    ? 'border-[#00FF66] shadow-[0_0_25px_rgba(0,255,102,0.6)] bg-[#00FF66]/20' 
                    : 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                }`}>
                  {/* Glowing Laser Scan Line */}
                  {scanning && !processingCode && (
                    <div className="absolute inset-x-0 h-[3px] bg-[#00FF66] shadow-[0_0_10px_#00FF66] animate-[scan_2s_ease-in-out_infinite] top-0" />
                  )}

                  {/* Corner Targets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00FF66]" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00FF66]" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00FF66]" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00FF66]" />
                  
                  {processingCode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                      <div className="flex flex-col items-center gap-1">
                        <UserCheck className="h-8 w-8 text-[#00FF66] animate-bounce stroke-[2.5]" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#00FF66]">Verifying Ticket</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Switch Control */}
              {videoDevices.length > 1 && (
                <button 
                  onClick={switchCamera}
                  type="button"
                  className="absolute bottom-4 right-4 bg-white hover:bg-zinc-100 border-2 border-black p-3 text-black shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer"
                  title="Switch Camera"
                >
                  <RotateCw className="h-5 w-5 stroke-[2.5]" />
                </button>
              )}

              {/* Sound Status indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-white px-2 py-1 border-2 border-black text-[10px] text-black font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                <Volume2 className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                <span>Audio On</span>
              </div>
            </>
          )}
        </div>

        {/* Controls, Manual entry, & History */}
        <div className="p-4 space-y-4 bg-white flex-1 overflow-y-auto max-h-[40vh]">
          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Or enter Ticket Ref ID manually..."
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                disabled={manualLoading}
                className="bg-white border-2 border-black text-black placeholder:text-zinc-400 font-bold pr-10 text-xs h-9 rounded-none shadow-[2px_2px_0px_0px_#000000] focus-visible:ring-0"
              />
              <CornerDownLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 stroke-[2.5]" />
            </div>
            <Button 
              type="submit" 
              disabled={manualLoading || !manualId.trim()}
              className="bg-[#00FF66] hover:bg-[#00dd55] text-black font-black text-xs uppercase tracking-wider h-9 px-3 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              {manualLoading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : 'Check In'}
            </Button>
          </form>

          {/* Recent Scan History */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-wider text-zinc-600">
              Recent Scans ({history.length})
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No tickets scanned in this session.</p>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2.5 border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_#000000] transition-all ${
                      item.status === 'success' 
                        ? 'bg-[#00FF66]/20 text-black' 
                        : item.status === 'already'
                        ? 'bg-[#FFE600]/30 text-black'
                        : 'bg-[#FF0055]/20 text-black'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-black truncate">{item.name}</span>
                      <span className="text-[10px] text-zinc-600 font-mono font-bold truncate">
                        ID: {item.id.slice(0, 8)}... ({item.rollNo})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className="text-[10px] font-black uppercase">
                        {item.message}
                      </span>
                      {item.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-black flex-shrink-0 stroke-[2.5]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-black flex-shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-zinc-50 border-t-2 border-black flex justify-end">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase tracking-wider py-1 h-8 rounded-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            Close Scanner
          </Button>
        </div>
      </DialogContent>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(256px);
          }
        }
      `}</style>
    </Dialog>
  );
}
