/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

const Scanner = ({ onScanSuccess }) => {
    const [error, setError] = useState(null);
    const [isStarting, setIsStarting] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
    const html5QrCodeRef = useRef(null);
    const scannerId = "reader";

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    };

    const startScanner = async (cameraIdOrFacingMode) => {
        setIsStarting(true);
        setError(null);

        try {
            await stopScanner();

            const formatsToSupport = [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF
            ];

            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerId, {
                    formatsToSupport: formatsToSupport,
                    verbose: false
                });
            }

            const config = {
                fps: 20,
                aspectRatio: 1.0,
                qrbox: { width: 250, height: 250 } // Added a scan box for better UX
            };

            await html5QrCodeRef.current.start(
                cameraIdOrFacingMode,
                config,
                (decodedText) => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    onScanSuccess(decodedText);
                },
                () => { } // Frame errors
            );

            setIsStarting(false);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setIsStarting(false);
            if (err.name === 'NotAllowedError' || err.toString().includes("Permission denied")) {
                setError('PERMISO_DENEGADO');
            } else {
                setError('ERROR_DESCONOCIDO');
            }
        }
    };

    const initializeCameras = async () => {
        try {
            // Intentar obtener cámaras con etiquetas (puede requerir permiso previo)
            let devices = await Html5Qrcode.getCameras();

            // Si no hay etiquetas, iniciamos con modo genérico para disparar el permiso
            if (!devices || devices.length === 0 || (devices.length > 0 && devices[0].label === "")) {
                await startScanner({ facingMode: "environment" });
                // Re-obtener ahora que ya tenemos permiso
                devices = await Html5Qrcode.getCameras();
            }

            if (devices && devices.length > 0) {
                setCameras(devices);

                // Buscar la cámara "principal"
                let principalCamera = devices[0];
                const backCamera = devices.find(d =>
                    d.label.toLowerCase().includes('back') ||
                    d.label.toLowerCase().includes('trasera') ||
                    d.label.toLowerCase().includes('rear') ||
                    d.label.toLowerCase().includes('0')
                );

                if (backCamera) {
                    principalCamera = backCamera;
                    const index = devices.indexOf(backCamera);
                    setCurrentCameraIndex(index);
                    // Si ya iniciamos con facingMode, y esta cámara es diferente, cambiamos para asegurar la principal
                    await startScanner(principalCamera.id);
                } else if (devices[0].id) {
                    await startScanner(devices[0].id);
                }
            } else {
                await startScanner({ facingMode: "environment" });
            }
        } catch (err) {
            console.error("Error initialing cameras:", err);
            await startScanner({ facingMode: "environment" });
        }
    };

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            #${scannerId} video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 2.5rem !important;
            }
            #${scannerId} { background: #000 !important; }
        `;
        document.head.appendChild(style);

        const timer = setTimeout(() => initializeCameras(), 500);

        return () => {
            clearTimeout(timer);
            document.head.removeChild(style);
            stopScanner();
        };
    }, []);

    const switchCamera = async () => {
        if (cameras.length < 2) return;
        const nextIndex = (currentCameraIndex + 1) % cameras.length;
        setCurrentCameraIndex(nextIndex);
        await startScanner(cameras[nextIndex].id);
    };

    const handleRetry = () => window.location.reload();

    return (
        <div className="relative w-full h-full mx-auto overflow-hidden bg-black flex flex-col items-center justify-center">
            {isStarting && !error && (
                <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-500/20">
                        <Camera className="text-blue-500 animate-pulse" size={40} />
                    </div>
                    <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Iniciando Cámara...</p>
                </div>
            )}

            {error === 'PERMISO_DENEGADO' && (
                <div className="absolute inset-0 z-30 bg-slate-900 p-8 flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                        <CameraOff size={32} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-white font-black text-lg uppercase tracking-tight">Acceso Denegado</h3>
                        <p className="text-slate-400 text-xs font-medium max-w-[200px] mx-auto leading-relaxed">
                            No podemos acceder a la cámara. Por favor habilita los permisos.
                        </p>
                    </div>
                    <button onClick={handleRetry} className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase text-xs active:scale-95 transition-all shadow-xl">
                        Configurar Permisos
                    </button>
                </div>
            )}

            <div id={scannerId} className="w-full h-full scale-[1.01]"></div>

            {/* BOTÓN DE CAMBIO DE CÁMARA */}
            {cameras.length > 1 && !isStarting && !error && (
                <button
                    onClick={switchCamera}
                    className="absolute top-6 right-6 z-40 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all active:scale-90 flex items-center gap-2 border border-white/20"
                >
                    <RefreshCw size={20} />
                    <span className="text-[10px] font-black uppercase">Cambiar Lente</span>
                </button>
            )}

            {/* Guía Visual: Solo el Láser */}
            {!isStarting && !error && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="relative w-full h-full bg-transparent flex items-center justify-center">
                        <div className="w-[90%] h-[2px] bg-red-500 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(239,68,68,0.8)] opacity-60"></div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-40vh); opacity: 0.3; }
                    50% { transform: translateY(40vh); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
export default Scanner;
