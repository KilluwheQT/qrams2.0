'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AttendanceTable from '@/components/AttendanceTable';
import { getAllEvents, getAttendanceSummary } from '@/lib/firestore';
import { ClipboardList, Calendar, Download } from 'lucide-react';
import QRLoader, { QRLoaderFullPage } from '@/components/QRLoader';

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      loadAttendanceSummary(selectedEvent);
    } else {
      setSummary(null);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async (eventId) => {
    setLoadingSummary(true);
    try {
      const data = await getAttendanceSummary(eventId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (authLoading || !user) {
    return <QRLoaderFullPage message="Loading attendance..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Attendance Reports</h1>
          <p className="text-gray-600 mt-1">View and export attendance records</p>
        </div>

        {/* Event Selector */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <label className="font-medium text-gray-700">Select Event:</label>
            </div>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select an event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {event.eventDate}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading || loadingSummary ? (
          <div className="flex justify-center py-12">
            <QRLoader size="md" />
          </div>
        ) : !selectedEvent ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Select an event to view attendance records</p>
          </div>
        ) : summary ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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

            {/* Attendance Rate */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Attendance Rate</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${summary.totalStudents > 0 
                      ? Math.round((summary.signedIn / summary.totalStudents) * 100) 
                      : 0}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {summary.totalStudents > 0 
                    ? Math.round((summary.signedIn / summary.totalStudents) * 100) 
                    : 0}% attendance rate
                </span>
                <span>{summary.signedIn} of {summary.totalStudents} students</span>
              </div>
            </div>

            {/* Attendance Table */}
            <AttendanceTable records={summary.records} event={summary.event} />
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No attendance data available</p>
          </div>
        )}
      </main>
    </div>
  );
}
