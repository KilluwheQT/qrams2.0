'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Users, Calendar, ClipboardCheck } from 'lucide-react';
import { QRLoaderFullPage } from '@/components/QRLoader';
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
    return <QRLoaderFullPage message="Loading..." />;
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
      <header className="py-4 sm:py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-white">
            <QrCode className="h-8 w-8" />
            <span className="font-bold text-xl">QRAMS</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/student/login"
              className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm sm:text-base"
            >
              Student
            </Link>
            <Link
              href="/login"
              className="px-4 sm:px-6 py-2 bg-white text-blue-800 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm sm:text-base"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center text-white mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            QR Code-Based Attendance System
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-200 mb-3 sm:mb-4">
            Event Sign-In and Sign-Out for Students
          </p>
          <p className="text-base sm:text-lg text-blue-300">
            Rizal Memorial Institute of Dapitan City, Inc.
          </p>
          <p className="text-blue-400 mt-2 text-sm sm:text-base">School Year 2025-2026</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
            <QrCode className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 text-blue-300" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">QR Scanning</h3>
            <p className="text-blue-200 text-xs sm:text-sm hidden sm:block">
              Fast and accurate attendance tracking
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 text-blue-300" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Students</h3>
            <p className="text-blue-200 text-xs sm:text-sm hidden sm:block">
              Register and manage student records
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 text-blue-300" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Events</h3>
            <p className="text-blue-200 text-xs sm:text-sm hidden sm:block">
              Create and manage school events
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white">
            <ClipboardCheck className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 text-blue-300" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Reports</h3>
            <p className="text-blue-200 text-xs sm:text-sm hidden sm:block">
              Monitor attendance in real-time
            </p>
          </div>
        </div>

        {/* CTA for Students */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Link
            href="/scan"
            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-800 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Scan QR Code</span>
          </Link>
          <p className="text-blue-300 text-xs sm:text-sm px-4">
            Scan QR codes to record attendance
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
