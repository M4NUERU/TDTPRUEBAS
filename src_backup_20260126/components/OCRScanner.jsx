import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, RefreshCw, AlertCircle, CameraOff, Smartphone } from 'lucide-react';

const OCRScanner = ({ onDetected }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isStarting, setIsStarting] = useState(true);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setIsStarting(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsStarting(false);
        } catch (err) {
            console.error("Error OCR Camera:", err);
            setIsStarting(false);
            if (err.name === 'NotAllowedError' || err.toString().includes("Permission denied")) {
                setError("PERMISO_DENEGADO");
            } else {
                setError("No se pudo acceder a la cámara");
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current || loading) return;

        setLoading(true);
        setError(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const { data: { text } } = await Tesseract.recognize(
                canvas.toDataURL('image/jpeg'),
                'spa',
                { logger: m => console.log(m) }
            );

            const ocPattern = /\b(150\d+|350\d+|TTJ[A-Z0-9-]+|EXITCO[A-Z0-9-]+|LPD[A-Z0-9-]+)\b/i;
            const match = text.match(ocPattern);

            if (match) {
                onDetected(match[0].toUpperCase());
            } else {
                setError("No se detectó un número de OC claro. Intenta de nuevo.");
            }
        } catch (err) {
            setError("Error procesando imagen");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-2">
            <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center">
                {isStarting && !error && (
                    <div className="flex flex-col items-center gap-3">
                        <Camera className="text-blue-500 animate-pulse" size={40} />
                        <p className="text-blue-400 font-black text-[10px] uppercase">Inicializando Escáner...</p>
                    </div>
                )}

                {error === "PERMISO_DENEGADO" ? (
                    <div className="p-6 text-center flex flex-col items-center gap-4">
                        <CameraOff className="text-red-500" size={40} />
                        <h3 className="text-white font-black text-sm uppercase">Cámara Bloqueada</h3>
                        <p className="text-slate-400 text-[10px]">Toca el candado <Smartphone size={10} className="inline" /> en la barra de arriba y activa la **Cámara**.</p>
                        <button onClick={handleRetry} className="mt-2 px-6 py-2 bg-white text-slate-900 font-black rounded-xl text-[10px] uppercase">Reintentar</button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover ${isStarting || error ? 'hidden' : 'block'}`}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                    </>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                        <RefreshCw size={48} className="animate-spin mb-4 text-blue-300" />
                        <p className="font-black text-lg uppercase tracking-tight">Procesando Imagen</p>
                        <p className="text-xs opacity-80 font-bold uppercase tracking-wider">Buscando número de OC...</p>
                    </div>
                )}
            </div>

            {error && error !== "PERMISO_DENEGADO" && (
                <div className="mt-4 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <AlertCircle size={20} />
                    <p className="text-[10px] font-black uppercase">{error}</p>
                </div>
            )}

            {!isStarting && !error && (
                <button
                    onClick={captureAndProcess}
                    disabled={loading}
                    className="w-full mt-6 py-5 bg-blue-600 text-white font-black text-sm rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 uppercase"
                >
                    <Camera size={24} />
                    DETECTAR OC
                </button>
            )}

            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-6 leading-relaxed">
                Apunta al número de OC y presiona el botón. <br />
                <span className="text-blue-500/60 font-black">Escáner de Texto Integrado</span>
            </p>
        </div>
    );
};

export default OCRScanner;
