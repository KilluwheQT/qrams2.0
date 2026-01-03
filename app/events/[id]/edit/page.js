'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EventForm from '@/components/EventForm';
import { getEventById, updateEvent } from '@/lib/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditEventPage() {
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

  const handleSubmit = async (data) => {
    await updateEvent(params.id, data);
    router.push(`/events/${params.id}`);
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
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/events/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Event</h1>
          <p className="text-gray-600 mt-1">Update event details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/events/${params.id}`)}
          />
        </div>
      </main>
    </div>
  );
}
