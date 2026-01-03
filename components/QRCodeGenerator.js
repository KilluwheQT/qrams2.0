'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, Shield } from 'lucide-react';

// QR code validity window in seconds (must match scanner validation)
const QR_VALIDITY_SECONDS = 30;
const REFRESH_INTERVAL_MS = 10000; // Refresh every 10 seconds

// Generate a time-based token that changes every QR_VALIDITY_SECONDS
function generateTimeToken() {
  const now = Math.floor(Date.now() / 1000);
  const timeSlot = Math.floor(now / QR_VALIDITY_SECONDS);
  return timeSlot.toString(36); // Base36 for shorter string
}

export default function QRCodeGenerator({ eventId, eventTitle, type = 'sign-in' }) {
  const canvasRef = useRef(null);
  const [timeToken, setTimeToken] = useState('');
  const [countdown, setCountdown] = useState(QR_VALIDITY_SECONDS);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Generate QR code with current time token
  const generateQR = useCallback(() => {
    if (!eventId || !canvasRef.current) return;

    const token = generateTimeToken();
    setTimeToken(token);
    setLastRefresh(new Date());

    // QR code data contains event ID, type, and time-based token
    const data = JSON.stringify({
      eventId,
      type,
      token, // Time-based token for validation
      ts: Date.now() // Timestamp for reference
    });

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
  }, [eventId, type]);

  // Initial generation and auto-refresh
  useEffect(() => {
    generateQR();

    // Auto-refresh QR code
    const refreshInterval = setInterval(() => {
      generateQR();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshInterval);
  }, [generateQR]);

  // Countdown timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const currentSlot = Math.floor(now / QR_VALIDITY_SECONDS);
      const nextSlotTime = (currentSlot + 1) * QR_VALIDITY_SECONDS;
      const remaining = nextSlotTime - now;
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${eventTitle || 'event'}-${type}-qr.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const manualRefresh = () => {
    generateQR();
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {type === 'sign-in' ? 'Sign-In' : 'Sign-Out'} QR Code
      </h3>
      <p className="text-sm text-gray-500 mb-3">{eventTitle}</p>
      
      {/* Security indicator */}
      <div className="flex items-center space-x-2 mb-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-xs font-medium text-green-700">Secure • Auto-refresh enabled</span>
      </div>
      
      {/* QR Code with refresh animation */}
      <div className="relative">
        <div className="border-4 border-blue-800 rounded-lg p-2 bg-white">
          <canvas ref={canvasRef} />
        </div>
        
        {/* Countdown overlay */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
          <RefreshCw className={`h-3 w-3 ${countdown <= 5 ? 'animate-spin' : ''}`} />
          <span>Refreshes in {countdown}s</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-2 mt-6">
        <button
          onClick={manualRefresh}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Now</span>
        </button>
        <button
          onClick={downloadQR}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>
      
      <p className="mt-3 text-xs text-gray-400 text-center">
        QR code auto-refreshes every {REFRESH_INTERVAL_MS / 1000}s to prevent screenshot reuse
      </p>
    </div>
  );
}
