'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EventForm from '@/components/EventForm';
import { createEvent } from '@/lib/firestore';
import { ArrowLeft } from 'lucide-react';
import { QRLoaderFullPage } from '@/components/QRLoader';
import Link from 'next/link';

export default function NewEventPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (data) => {
    await createEvent(data);
    router.push('/events');
  };

  if (authLoading || !user) {
    return <QRLoaderFullPage message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Create New Event</h1>
          <p className="text-gray-600 mt-1">Set up a new school event with attendance tracking</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <EventForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/events')}
          />
        </div>
      </main>
    </div>
  );
}
