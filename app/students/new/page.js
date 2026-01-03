'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StudentForm from '@/components/StudentForm';
import { addStudent } from '@/lib/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewStudentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (data) => {
    await addStudent(data);
    router.push('/students');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Students
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Add New Student</h1>
          <p className="text-gray-600 mt-1">Register a new student in the system</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <StudentForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/students')}
          />
        </div>
      </main>
    </div>
  );
}
