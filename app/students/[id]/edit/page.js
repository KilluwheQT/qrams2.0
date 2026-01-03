'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StudentForm from '@/components/StudentForm';
import { getStudentById, updateStudent } from '@/lib/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditStudentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadStudent();
    }
  }, [user, params.id]);

  const loadStudent = async () => {
    try {
      const data = await getStudentById(params.id);
      if (!data) {
        router.push('/students');
        return;
      }
      setStudent(data);
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    await updateStudent(params.id, data);
    router.push(`/students/${params.id}`);
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/students/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Student
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Student</h1>
          <p className="text-gray-600 mt-1">Update student information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <StudentForm
            student={student}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/students/${params.id}`)}
          />
        </div>
      </main>
    </div>
  );
}
