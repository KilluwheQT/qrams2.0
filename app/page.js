'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Users, Calendar, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <QrCode className="h-8 w-8" />
            <span className="font-bold text-xl">QRAMS</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/student/login"
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Student Login
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-white text-blue-800 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            QR Code-Based Attendance System
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-4">
            Event Sign-In and Sign-Out for Students
          </p>
          <p className="text-lg text-blue-300">
            Rizal Memorial Institute of Dapitan City, Inc.
          </p>
          <p className="text-blue-400 mt-2">School Year 2025-2026</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <QrCode className="h-12 w-12 mb-4 text-blue-300" />
            <h3 className="text-lg font-semibold mb-2">QR Code Scanning</h3>
            <p className="text-blue-200 text-sm">
              Fast and accurate attendance tracking using QR codes
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Users className="h-12 w-12 mb-4 text-blue-300" />
            <h3 className="text-lg font-semibold mb-2">Student Management</h3>
            <p className="text-blue-200 text-sm">
              Register and manage student records efficiently
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Calendar className="h-12 w-12 mb-4 text-blue-300" />
            <h3 className="text-lg font-semibold mb-2">Event Management</h3>
            <p className="text-blue-200 text-sm">
              Create and manage school events with ease
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <ClipboardCheck className="h-12 w-12 mb-4 text-blue-300" />
            <h3 className="text-lg font-semibold mb-2">Real-time Reports</h3>
            <p className="text-blue-200 text-sm">
              Monitor attendance and generate reports instantly
            </p>
          </div>
        </div>

        {/* CTA for Students */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/scan"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-800 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              <QrCode className="h-6 w-6" />
              <span>Scan QR Code to Attend</span>
            </Link>
            
          </div>
          <p className="text-blue-300 text-sm">
            Scan QR codes to record attendance or login to view your attendance history
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-blue-300 text-sm">
        <p>© 2025 Rizal Memorial Institute of Dapitan City, Inc.</p>
        <p className="mt-1">QR Code-Based Attendance Management System</p>
      </footer>
    </div>
  );
}
