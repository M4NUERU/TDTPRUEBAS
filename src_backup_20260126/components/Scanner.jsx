import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

const Scanner = ({ onScanSuccess }) => {
    const [error, setError] = useState(null);
    const [isStarting, setIsStarting] = useState(true);
    const html5QrCodeRef = useRef(null);
    const scannerId = "reader";

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            #${scannerId} video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 2.5rem !important;
            }
            #${scannerId} {
                background: #000 !important;
            }
        `;
        document.head.appendChild(style);

        const startScanner = async () => {
            setIsStarting(true);
            setError(null);

            try {
                // Lista completa de formatos para máxima compatibilidad
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

                const html5QrCode = new Html5Qrcode(scannerId, {
                    formatsToSupport: formatsToSupport,
                    verbose: false
                });
                html5QrCodeRef.current = html5QrCode;

                const config = {
                    fps: 20, // Mayor FPS para mayor fluidez
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        // Área de escaneo dinámica: ancha para códigos de barras
                        const width = viewfinderWidth * 0.8;
                        const height = viewfinderHeight * 0.4;
                        return { width: width, height: height };
                    },
                    aspectRatio: 1.0,
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        // Sonido sutil si es posible o vibración
                        if (navigator.vibrate) navigator.vibrate(50);
                        onScanSuccess(decodedText);
                    },
                    () => { } // Errores de frame
                );

                setIsStarting(false);
            } catch (err) {
                console.error("Error al iniciar cámara:", err);
                setIsStarting(false);

                if (err.name === 'NotAllowedError' || err.toString().includes("Permission denied")) {
                    setError('PERMISO_DENEGADO');
                } else {
                    setError('ERROR_DESCONOCIDO');
                }
            }
        };

        const timer = setTimeout(startScanner, 1000);

        return () => {
            clearTimeout(timer);
            document.head.removeChild(style);
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(e => console.log("Error al detener", e));
            }
        };
    }, [onScanSuccess]);

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
                            No podemos acceder a la cámara. Por favor habilita los permisos en tu navegador.
                        </p>
                    </div>

                    <button
                        onClick={handleRetry}
                        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase text-xs active:scale-95 transition-all shadow-xl"
                    >
                        Configurar Permisos
                    </button>
                </div>
            )}

            <div id={scannerId} className="w-full h-full scale-[1.01]"></div>

            {/* Guía Visual: Láser y recuadro */}
            {!isStarting && !error && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    {/* Badge Superior */}


                    {/* Área de enfoque (Transparente) */}
                    <div className="relative w-[80%] h-[25%] sm:w-[500px] sm:h-[200px] bg-transparent flex items-center justify-center">
                        {/* Borde de Enfoque */}
                        <div className="absolute inset-0 border-2 border-white/20 rounded-[2rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>

                        {/* Esquinas Brillantes */}
                        <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-[1.8rem]"></div>
                        <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-[1.8rem]"></div>
                        <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-[1.8rem]"></div>
                        <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-[1.8rem]"></div>

                        {/* Láser escaneando */}
                        <div className="w-[95%] h-[2px] bg-red-500 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(239,68,68,0.8)] opacity-60"></div>

                        {/* Punto central */}
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-40px); opacity: 0.3; }
                    50% { transform: translateY(40px); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Scanner;
