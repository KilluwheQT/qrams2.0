'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { getEventById } from '@/lib/firestore';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function EventQRPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadEvent();
    }
  }, [user, params.id]);

  const loadEvent = async () => {
    try {
      const data = await getEventById(params.id);
      if (!data) {
        router.push('/events');
        return;
      }
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <Link
            href={`/events/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">QR Codes</h1>
              <p className="text-gray-600 mt-1">{event.title}</p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              <Printer className="h-4 w-4" />
              <span>Print QR Codes</span>
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-gray-600">{event.eventDate} • {event.venue}</p>
          <p className="text-sm text-gray-500 mt-2">Rizal Memorial Institute of Dapitan City, Inc.</p>
        </div>

        {/* Event Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 print:hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{event.eventDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Venue</p>
              <p className="font-medium">{event.venue}</p>
            </div>
            <div>
              <p className="text-gray-500">Sign-In Time</p>
              <p className="font-medium">{event.signInStart} - {event.signInEnd}</p>
            </div>
            <div>
              <p className="text-gray-500">Sign-Out Time</p>
              <p className="font-medium">{event.signOutStart} - {event.signOutEnd}</p>
            </div>
          </div>
        </div>

        {/* QR Codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
          <div className="print:break-inside-avoid">
            <QRCodeGenerator
              eventId={params.id}
              eventTitle={event.title}
              type="sign-in"
            />
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
              <p className="text-green-800 font-medium">Sign-In Session</p>
              <p className="text-sm text-green-600">
                {event.signInStart} - {event.signInEnd}
              </p>
              <p className="text-xs text-green-500 mt-1">
                Grace period: {event.gracePeriodMinutes || 15} minutes
              </p>
            </div>
          </div>

          <div className="print:break-inside-avoid">
            <QRCodeGenerator
              eventId={params.id}
              eventTitle={event.title}
              type="sign-out"
            />
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-800 font-medium">Sign-Out Session</p>
              <p className="text-sm text-blue-600">
                {event.signOutStart} - {event.signOutEnd}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-100 rounded-xl print:bg-white print:border">
          <h3 className="font-semibold text-gray-800 mb-3">Instructions for Students</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Open the QRAMS website on your mobile device</li>
            <li>Click "Scan QR Code to Attend" on the homepage</li>
            <li>Allow camera access when prompted</li>
            <li>Scan the appropriate QR code (Sign-In or Sign-Out)</li>
            <li>Enter your Student ID when prompted</li>
            <li>Wait for confirmation of your attendance</li>
          </ol>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
