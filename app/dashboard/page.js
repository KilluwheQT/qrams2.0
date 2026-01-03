'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { getAllStudents, getAllEvents, getAttendanceSummary } from '@/lib/firestore';
import { Users, Calendar, QrCode, ClipboardCheck, TrendingUp, Clock } from 'lucide-react';
import QRLoader from '@/components/QRLoader';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    todayAttendance: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [students, events] = await Promise.all([
        getAllStudents(),
        getAllEvents()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = events.filter(e => e.eventDate >= today);
      const todayEvents = events.filter(e => e.eventDate === today);

      let todayAttendance = 0;
      for (const event of todayEvents) {
        const summary = await getAttendanceSummary(event.id);
        todayAttendance += summary.signedIn;
      }

      setStats({
        totalStudents: students.length,
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        todayAttendance
      });

      setRecentEvents(events.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <QRLoader text="Loading Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to QRAMS - QR Code Attendance Management System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link href="/students" className="text-sm text-blue-600 hover:underline mt-4 inline-block">
              View all students →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link href="/events" className="text-sm text-green-600 hover:underline mt-4 inline-block">
              Manage events →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-800">{stats.upcomingEvents}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Link href="/events" className="text-sm text-yellow-600 hover:underline mt-4 inline-block">
              View schedule →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Attendance</p>
                <p className="text-3xl font-bold text-gray-800">{stats.todayAttendance}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link href="/attendance" className="text-sm text-purple-600 hover:underline mt-4 inline-block">
              View attendance →
            </Link>
          </div>
        </div>

        {/* Quick Actions & Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/students/new"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Student</span>
              </Link>
              <Link
                href="/events/new"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Create Event</span>
              </Link>
              <Link
                href="/scan"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <QrCode className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Scan QR</span>
              </Link>
              <Link
                href="/attendance"
                className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </Link>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Events</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No events yet</p>
                <Link href="/events/new" className="text-blue-600 hover:underline text-sm">
                  Create your first event
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.eventDate} • {event.venue}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
