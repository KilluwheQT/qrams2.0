'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

export default function QRCodeGenerator({ eventId, eventTitle, type = 'sign-in' }) {
  const canvasRef = useRef(null);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    if (eventId && canvasRef.current) {
      // QR code data contains event ID and type
      const data = JSON.stringify({
        eventId,
        type,
        timestamp: new Date().toISOString()
      });
      
      setQrData(data);
      
      QRCode.toCanvas(canvasRef.current, data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [eventId, type]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${eventTitle || 'event'}-${type}-qr.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {type === 'sign-in' ? 'Sign-In' : 'Sign-Out'} QR Code
      </h3>
      <p className="text-sm text-gray-500 mb-4">{eventTitle}</p>
      
      <div className="border-4 border-blue-800 rounded-lg p-2 bg-white">
        <canvas ref={canvasRef} />
      </div>
      
      <button
        onClick={downloadQR}
        className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Download QR Code</span>
      </button>
      
      <p className="mt-2 text-xs text-gray-400">
        Scan this code to {type === 'sign-in' ? 'sign in' : 'sign out'}
      </p>
    </div>
  );
}
