'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { getEventById, recordAttendance } from '@/lib/firestore';
import { QrCode, Camera, CheckCircle, XCircle, ArrowLeft, User, LogOut, Shield, AlertTriangle } from 'lucide-react';
import QRLoader from '@/components/QRLoader';
import Link from 'next/link';

// QR code validity window in seconds (must match generator)
const QR_VALIDITY_SECONDS = 30;

// Validate time-based token from QR code
function validateQRToken(token, ts) {
  if (!token || !ts) return { valid: false, reason: 'Missing security token' };
  
  const now = Math.floor(Date.now() / 1000);
  const qrTime = Math.floor(ts / 1000);
  
  // Check if QR code is too old (more than 2 validity windows)
  const maxAge = QR_VALIDITY_SECONDS * 2;
  if (now - qrTime > maxAge) {
    return { valid: false, reason: 'QR code has expired. Please scan a fresh code.' };
  }
  
  // Validate the time-based token
  const currentSlot = Math.floor(now / QR_VALIDITY_SECONDS);
  const previousSlot = currentSlot - 1;
  const expectedCurrentToken = currentSlot.toString(36);
  const expectedPreviousToken = previousSlot.toString(36);
  
  // Accept current or previous time slot (grace period)
  if (token === expectedCurrentToken || token === expectedPreviousToken) {
    return { valid: true };
  }
  
  return { valid: false, reason: 'QR code has expired. Please scan a fresh code.' };
}

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState('checking'); // checking, scan, confirm, processing, success, error
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [event, setEvent] = useState(null);
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  // Check if student is logged in
  useEffect(() => {
    const session = sessionStorage.getItem('studentSession');
    if (!session) {
      router.push('/student/login?redirect=scan');
      return;
    }
    
    const studentData = JSON.parse(session);
    setStudent(studentData);
    setStep('scan');
  }, [router]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('studentSession');
    router.push('/student/login');
  };

  const startScanning = () => {
    setScanning(true);
    setError('');
    setMessage('');
  };

  // Initialize scanner after DOM element is rendered
  useEffect(() => {
    if (!scanning) return;

    let html5Qrcode = null;

    const initScanner = async () => {
      try {
        html5Qrcode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              
              if (!data.eventId || !data.type) {
                throw new Error('Invalid QR code');
              }

              // Validate time-based token (security check)
              const tokenValidation = validateQRToken(data.token, data.ts);
              if (!tokenValidation.valid) {
                setError(tokenValidation.reason);
                return; // Don't stop scanner, let user try again
              }

              // Fetch event details
              const eventData = await getEventById(data.eventId);
              if (!eventData) {
                throw new Error('Event not found');
              }

              // Stop scanner before changing state
              await html5Qrcode.stop();
              
              setQrData(data);
              setEvent(eventData);
              setStep('confirm');
              setScanning(false);
            } catch (e) {
              setError('Invalid QR code. Please scan a valid event QR code.');
            }
          },
          (errorMessage) => {
            // Ignore scan errors
          }
        );
      } catch (err) {
        console.error('Camera error:', err);
        setError('Unable to access camera. Please allow camera permissions and try again.');
        setScanning(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };

  const validateTimeWindow = () => {
    if (!event || !qrData) return { valid: false, message: 'Invalid event data' };

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if event is today
    if (event.eventDate !== today) {
      return { 
        valid: false, 
        message: event.eventDate > today 
          ? 'This event has not started yet' 
          : 'This event has already ended'
      };
    }

    const currentTime = now.toTimeString().slice(0, 5);
    
    if (qrData.type === 'sign-in') {
      if (currentTime < event.signInStart) {
        return { valid: false, message: `Sign-in starts at ${event.signInStart}` };
      }
      if (currentTime > event.signInEnd) {
        return { valid: false, message: `Sign-in ended at ${event.signInEnd}` };
      }
    } else {
      if (currentTime < event.signOutStart) {
        return { valid: false, message: `Sign-out starts at ${event.signOutStart}` };
      }
      if (currentTime > event.signOutEnd) {
        return { valid: false, message: `Sign-out ended at ${event.signOutEnd}` };
      }
    }

    return { valid: true };
  };

  const handleConfirmAttendance = async () => {
    setStep('processing');
    setError('');

    try {
      // Validate time window
      const timeValidation = validateTimeWindow();
      if (!timeValidation.valid) {
        throw new Error(timeValidation.message);
      }

      // Record attendance using logged-in student's info
      await recordAttendance({
        eventId: qrData.eventId,
        eventTitle: event.title,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        type: qrData.type
      });

      setMessage(`${qrData.type === 'sign-in' ? 'Sign-In' : 'Sign-Out'} successful!`);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('error');
    }
  };

  const resetScanner = () => {
    setStep('scan');
    setQrData(null);
    setEvent(null);
    setMessage('');
    setError('');
  };

  // Show loading while checking session
  if (step === 'checking') {
    return <QRLoader text="Checking Session..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 animated-bg">
      {/* Floating Squares Animation */}
      <div className="floating-squares">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-white">
            <QrCode className="h-8 w-8" />
            <span className="font-bold text-xl">QRAMS</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/student/portal"
              className="text-blue-200 hover:text-white text-sm"
            >
              My Portal
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-blue-200 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Student Info Banner */}
        {student && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{student.firstName} {student.lastName}</p>
                <p className="text-sm text-blue-200">{student.studentId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scan Step */}
        {step === 'scan' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Scan QR Code</h1>
              <p className="text-gray-500 mt-1">
                Point your camera at the event QR code
              </p>
            </div>

            {!scanning ? (
              <div className="text-center">
                <div className="p-8 bg-gray-100 rounded-xl mb-6">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <button
                  onClick={startScanning}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="rounded-xl overflow-hidden mb-4" />
                <button
                  onClick={stopScanning}
                  className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Stop Scanning
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && event && student && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full mb-4 ${
                qrData.type === 'sign-in' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <User className={`h-8 w-8 ${
                  qrData.type === 'sign-in' ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Confirm {qrData.type === 'sign-in' ? 'Sign-In' : 'Sign-Out'}
              </h1>
              <p className="text-gray-500 mt-1">{event.title}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{event.eventDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Venue</p>
                  <p className="font-medium">{event.venue}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Recording attendance for:</p>
              <p className="font-semibold text-gray-800">{student.firstName} {student.lastName}</p>
              <p className="text-sm text-gray-600">{student.studentId}</p>
            </div>

            <button
              onClick={handleConfirmAttendance}
              className={`w-full py-3 text-white rounded-lg font-medium transition-colors ${
                qrData.type === 'sign-in'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm {qrData.type === 'sign-in' ? 'Sign-In' : 'Sign-Out'}
            </button>

            <button
              type="button"
              onClick={resetScanner}
              className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your attendance...</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
            <p className="text-gray-500 mb-2">{student?.firstName} {student?.lastName}</p>
            <p className="text-gray-500 mb-6">{event?.title}</p>
            <div className="space-y-3">
              <button
                onClick={resetScanner}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Scan Another
              </button>
              <Link
                href="/student/portal"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                View My Attendance
              </Link>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={resetScanner}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>Rizal Memorial Institute of Dapitan City, Inc.</p>
          <p className="mt-1">QR Code Attendance System</p>
        </div>
      </main>
    </div>
  );
}
