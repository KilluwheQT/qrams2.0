'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AttendanceTable from '@/components/AttendanceTable';
import { getEventById, getAttendanceSummary } from '@/lib/firestore';
import { ArrowLeft, Calendar, MapPin, Clock, Users, QrCode, Edit } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadEventData();
    }
  }, [user, params.id]);

  const loadEventData = async () => {
    try {
      const eventData = await getEventById(params.id);
      if (!eventData) {
        router.push('/events');
        return;
      }
      setEvent(eventData);

      const summaryData = await getAttendanceSummary(params.id);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
              </div>
              {event.description && (
                <p className="text-gray-600 mt-2">{event.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Link
                href={`/events/${params.id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <Link
                href={`/events/${params.id}/qr`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Codes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-800">{event.eventDate}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Venue</p>
              <p className="font-medium text-gray-800">{event.venue}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sign-In</p>
              <p className="font-medium text-gray-800">{event.signInStart} - {event.signInEnd}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sign-Out</p>
              <p className="font-medium text-gray-800">{event.signOutStart} - {event.signOutEnd}</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{summary.totalStudents}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.signedIn}</p>
              <p className="text-sm text-gray-500">Signed In</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.signedOut}</p>
              <p className="text-sm text-gray-500">Signed Out</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{summary.complete}</p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
              <p className="text-sm text-gray-500">Late</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Records</h2>
          {summary && (
            <AttendanceTable records={summary.records} event={event} />
          )}
        </div>
      </main>
    </div>
  );
}
