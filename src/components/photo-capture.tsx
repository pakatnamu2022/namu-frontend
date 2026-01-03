

import { useRef, useState, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, FlipHorizontal } from 'lucide-react';
import { Button } from "./ui/button";
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
    onPhotoCapture: (photoUrl: string) => void;
    capturedPhoto?: string | null;
    label?: string;
    variant?: 'start' | 'end';
    disabled?: boolean;
}

export function PhotoCapture({
    onPhotoCapture,
    capturedPhoto,
    label = 'Capturar Foto',
    variant = 'start',
    disabled = false,
}: PhotoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si es dispositivo móvil al montar
    useEffect(() => {
        const checkMobile = () => {
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            setIsMobile(mobileRegex.test(navigator.userAgent));
        };
        checkMobile();
    }, []);

    // Efecto para manejar el stream
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stream) return;

        video.srcObject = stream;

        // Función para manejar la reproducción
        const handlePlay = async () => {
            try {
                
                await video.play();
            } catch (err) {
                
                // En móviles, el autoplay puede estar restringido
                if (isMobile) {
                    setError('Haz clic en el video para activar la cámara');
                } else {
                    setError('Error al reproducir video');
                }
            }
        };

        // Usar canplay en lugar de loadedmetadata
        video.oncanplay = handlePlay;

        // Fallback
        setTimeout(handlePlay, 1000);

        // Cleanup
        return () => {
            video.oncanplay = null;
        };
    }, [stream, isMobile]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (stream) {
                
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Obtener lista de cámaras disponibles
    const getAvailableCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableCameras(videoDevices);
           
        } catch (err) {
            console.error('Error al enumerar dispositivos:', err);
        }
    };

    const startCamera = async () => {
        setError('');
        setIsCapturing(true);
        
        try {
            
            
            // Detener stream anterior si existe
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }

            // Obtener lista de cámaras primero
            await getAvailableCameras();

            // Estrategia diferente para móviles vs PC
            let constraints: MediaStreamConstraints;
            
            if (isMobile) {
                // En móviles: intentar cámara trasera primero
                try {
                    constraints = { 
                        video: { 
                            facingMode: 'environment',
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        },
                        audio: false 
                    };
                    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                    setFacingMode('environment');
                    
                    setStream(newStream);
                } catch (rearError) {
                   
                    // Fallback a cámara frontal
                    constraints = { 
                        video: { 
                            facingMode: 'user',
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        },
                        audio: false 
                    };
                    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                    setFacingMode('user');
                   
                    setStream(newStream);
                }
            } else {
                // En PC/Laptop: usar configuración simple
                constraints = { 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false 
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                // En PC, asumimos que es frontal
                setFacingMode('user');
                
                setStream(newStream);
            }

        } catch (err: any) {
            
            
            // Intentar con configuración mínima como último recurso
            if (err.name === 'OverconstrainedError') {
                try {
                   
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
                        video: true,
                        audio: false 
                    });
                    setStream(fallbackStream);
                    return;
                } catch (fallbackError) {
                    console.error('Fallback también falló:', fallbackError);
                }
            }
            
            setError(err.message || 'Error al acceder a la cámara');
            setIsCapturing(false);
        }
    };

    const switchCamera = async () => {
        if (!stream || availableCameras.length <= 1) {
            
            return;
        }

        try {
            
            
            // Detener stream actual
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            
            // Cambiar facingMode
            const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
            setFacingMode(newFacingMode);
            
            // Obtener nuevo stream
            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: newFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            
        } catch (err: any) {
            console.error('❌ Error al cambiar cámara:', err);
            setError('No se pudo cambiar la cámara');
            // Volver al modo anterior
            setFacingMode(facingMode === 'user' ? 'environment' : 'user');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCapturing(false);
        setError('');
    };

    const capturePhoto = () => {
        if (!videoRef.current || !stream) {
            setError('No hay video disponible');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!canvas) {
            setError('Canvas no disponible');
            return;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setError('El video no tiene dimensiones válidas');
            return;
        }

        // Configurar canvas - manejar orientación en móviles
        const isPortrait = video.videoHeight > video.videoWidth;
        
        if (isMobile && isPortrait) {
            // Para móviles en portrait, intercambiar dimensiones
            canvas.width = video.videoHeight;
            canvas.height = video.videoWidth;
        } else {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError('No se pudo obtener contexto 2D');
            return;
        }

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Para cámara frontal, aplicar efecto espejo
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        // Manejar rotación para móviles en portrait
        if (isMobile && isPortrait) {
            // Rotar 90 grados para corrección de orientación
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(video, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
        } else {
            // Dibujo normal para landscape
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Convertir a imagen
        const photoUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Enviar foto
        onPhotoCapture(photoUrl);
        
        // Detener cámara
        stopCamera();
    };

    const clearPhoto = () => {
        onPhotoCapture('');
        setError('');
    };

    const variantStyles = {
        start: {
            button: 'bg-green-600 hover:bg-green-700 text-white',
            flipCamera: 'bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200 shadow-lg opacity-80',
            border: 'border-green-300',
            icon: 'text-green-600',
            cancel: 'bg-red-600 hover:bg-red-700 text-white opacity-80'
        },
        end: {
            button: 'bg-red-600 hover:bg-red-700 text-white',
            flipCamera: 'bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200 shadow-lg opacity-80',
            border: 'border-red-300',
            icon: 'text-red-600',
            cancel: 'bg-red-600 hover:bg-red-700 text-white opacity-80'
        },
    };

    const styles = variantStyles[variant];

    // Si hay foto capturada
    if (capturedPhoto) {
        return (
            <div className="space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className={cn('h-4 w-4', styles.icon)} />
                    {label}
                </p>
                <div className={cn('relative rounded-lg overflow-hidden border-2', styles.border)}>
                    <img 
                        src={capturedPhoto}
                        alt="Foto capturada"
                        className="w-full h-48 object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={clearPhoto}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Si está en modo captura
    if (isCapturing) {
        return (
            <div className="space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Camera className={cn('h-4 w-4 animate-pulse', styles.icon)} />
                    Vista previa - Posiciona para la foto
                    {isMobile && (
                        <span className="text-xs text-muted-foreground ml-2">
                            ({facingMode === 'user' ? 'Frontal' : 'Trasera'})
                        </span>
                    )}
                </p>
                
                <div className={cn('relative rounded-lg overflow-hidden border-2', styles.border)}>
                    {/* CONTENEDOR DEL VIDEO */}
                    <div className="w-full h-48 bg-black relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{
                                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                                WebkitTransform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                            }}
                        />
                        
                        {/* OVERLAY DE INFO */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {stream ? 'Cámara activa' : 'Cámara inactiva'}
                            {isMobile && availableCameras.length > 1 && ` · ${availableCameras.length} cam`}
                        </div>
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* CONTROLES */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className={cn('h-12 w-12 rounded-full', styles.cancel)}
                            onClick={stopCamera}
                            disabled={disabled}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        
                        {/* Botón para cambiar cámara (solo en móviles con múltiples cámaras) */}
                        {isMobile && availableCameras.length > 1 && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className={cn('h-12 w-12 rounded-full', styles.flipCamera)}
                                onClick={switchCamera}
                                disabled={disabled}
                                title={`Cambiar a cámara ${facingMode === 'user' ? 'trasera' : 'frontal'}`}
                            >
                                <FlipHorizontal className="h-5 w-5" />
                            </Button>
                        )}
                        
                        <Button
                            type="button"
                            size="icon"
                            className={cn('h-12 w-12 rounded-full', styles.button)}
                            onClick={capturePhoto}
                            disabled={disabled}
                        >
                            <Camera className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
                
                {error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}
                
                <div className="text-xs text-center text-muted-foreground">
                    {isMobile 
                        ? 'Toca el botón de cámara para capturar' 
                        : 'Haz clic en la cámara para capturar foto'}
                </div>
            </div>
        );
    }

    // Estado inicial - Botón para iniciar
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Camera className={cn('h-4 w-4', styles.icon)} />
                {label}
            </p>
            
            <Button
                type="button"
                variant="outline"
                className={cn(
                    'w-full h-24 border-dashed border-2 flex flex-col items-center justify-center gap-2',
                    styles.border,
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={startCamera}
                disabled={disabled}
            >
                <Camera className={cn('h-8 w-8', styles.icon)} />
                <span className="text-sm text-muted-foreground">
                    {isMobile ? 'Abrir cámara' : 'Iniciar cámara'}
                </span>
                {isMobile && (
                    <span className="text-xs text-gray-500">(Usará cámara trasera)</span>
                )}
            </Button>
            
            {error && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-700">{error}</p>
                </div>
            )}
        </div>
    );
}