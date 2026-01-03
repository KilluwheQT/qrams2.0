'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function QRCodeScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setResult(null);
    setError(null);

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          setResult(data);
          if (onScan) onScan(data);
          scanner.clear().catch(console.error);
          setScanning(false);
        } catch (e) {
          setError('Invalid QR code format');
          if (onError) onError('Invalid QR code format');
        }
      },
      (errorMessage) => {
        // Ignore scan errors (no QR code in frame)
      }
    );

    scannerRef.current = scanner;
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setScanning(false);
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        QR Code Scanner
      </h3>

      {!scanning && !result && (
        <button
          onClick={startScanning}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Camera className="h-5 w-5" />
          <span>Start Scanning</span>
        </button>
      )}

      {scanning && (
        <div className="w-full max-w-md">
          <div id="qr-reader" className="rounded-lg overflow-hidden" />
          <button
            onClick={stopScanning}
            className="mt-4 flex items-center justify-center space-x-2 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            <span>Stop Scanning</span>
          </button>
        </div>
      )}

      {result && (
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-semibold">QR Code Scanned Successfully!</p>
          <p className="text-sm text-gray-500 mt-2">
            Event ID: {result.eventId}
          </p>
          <p className="text-sm text-gray-500">
            Type: {result.type === 'sign-in' ? 'Sign-In' : 'Sign-Out'}
          </p>
          <button
            onClick={resetScanner}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Scan Another
          </button>
        </div>
      )}

      {error && (
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={resetScanner}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
