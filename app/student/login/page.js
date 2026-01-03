'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStudentByStudentId } from '@/lib/firestore';
import { QrCode, User, ArrowLeft } from 'lucide-react';
import QRLoader from '@/components/QRLoader';
import Link from 'next/link';

function StudentLoginForm() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Check if already logged in
  useEffect(() => {
    const session = sessionStorage.getItem('studentSession');
    if (session) {
      router.push(redirect === 'scan' ? '/scan' : '/student/portal');
    }
  }, [router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const student = await getStudentByStudentId(studentId);
      
      if (!student) {
        throw new Error('Student ID not found. Please check your ID and try again.');
      }

      // Store student info in sessionStorage for the portal
      sessionStorage.setItem('studentSession', JSON.stringify({
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        course: student.course,
        yearLevel: student.yearLevel,
        section: student.section
      }));

      // Redirect to scan page if that was the intended destination
      router.push(redirect === 'scan' ? '/scan' : '/student/portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center px-4 animated-bg">
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

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-white">
            <QrCode className="h-12 w-12" />
            <span className="font-bold text-3xl">QRAMS</span>
          </Link>
          <p className="text-green-200 mt-2">Student Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <User className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Student Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Student ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  placeholder="e.g., 2025-00001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg text-gray-900 bg-white"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/scan" className="block text-sm text-green-600 hover:text-green-800">
              Scan QR Code for Attendance →
            </Link>
            <Link href="/" className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-green-300 text-sm mt-8">
          Rizal Memorial Institute of Dapitan City, Inc.
        </p>
      </div>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <QRLoader size="lg" />
        <p className="mt-4 text-white text-sm">Loading...</p>
      </div>
    }>
      <StudentLoginForm />
    </Suspense>
  );
}
