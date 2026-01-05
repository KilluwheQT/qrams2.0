'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentByStudentId, updateStudent } from '@/lib/firestore';
import { QrCode, User, ArrowLeft, Save } from 'lucide-react';
import QRLoader from '@/components/QRLoader';
import Link from 'next/link';

export default function EditStudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    gradeLevel: '',
    strand: '',
    section: ''
  });

  const STRANDS = ['STEM', 'ABM', 'HUMSS'];
  const GRADE_LEVELS = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const isSeniorHigh = (gradeLevel) => gradeLevel === 'Grade 11' || gradeLevel === 'Grade 12';

  useEffect(() => {
    const session = sessionStorage.getItem('studentSession');
    if (!session) {
      router.replace('/student/login');
      return;
    }

    const studentData = JSON.parse(session);
    setStudent(studentData);
    setFormData({
      gradeLevel: studentData.gradeLevel || '',
      strand: studentData.strand || '',
      section: studentData.section || ''
    });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Clear strand if switching to junior high
      if (name === 'gradeLevel' && !isSeniorHigh(value)) {
        newData.strand = '';
      }
      // Set default strand if switching to senior high and no strand selected
      if (name === 'gradeLevel' && isSeniorHigh(value) && !prev.strand) {
        newData.strand = STRANDS[0];
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Get the full student record from database
      const fullStudent = await getStudentByStudentId(student.studentId);
      
      if (!fullStudent) {
        throw new Error('Student record not found');
      }

      // Update only allowed fields
      await updateStudent(fullStudent.id, {
        gradeLevel: formData.gradeLevel,
        strand: formData.strand,
        section: formData.section
      });

      // Update session storage with new data
      const updatedSession = {
        ...student,
        gradeLevel: formData.gradeLevel,
        strand: formData.strand,
        section: formData.section
      };
      sessionStorage.setItem('studentSession', JSON.stringify(updatedSession));

      setSaving(false);
      setSuccess('Profile updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.replace('/student/portal');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <QRLoader size="lg" />
        <p className="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8" />
              <span className="font-bold text-lg">QRAMS</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/student/portal"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Portal
        </Link>

        {/* Edit Form Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
              <p className="text-sm text-gray-500">Update your academic information</p>
            </div>
          </div>

          {/* Non-editable fields */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">These fields cannot be changed:</p>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Name: </span>
                <span className="text-sm font-medium text-gray-800">
                  {student?.firstName} {student?.lastName}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Student ID: </span>
                <span className="text-sm font-medium text-gray-800">{student?.studentId}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select Grade Level</option>
                {GRADE_LEVELS.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Strand - Only for Senior High */}
            {isSeniorHigh(formData.gradeLevel) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strand
                </label>
                <select
                  name="strand"
                  value={formData.strand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">Select Strand</option>
                  {STRANDS.map(strand => (
                    <option key={strand} value={strand}>{strand}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Section / Block */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section / Block
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                placeholder="e.g., A, B, C or Block 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <QRLoader size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push('/student/portal')}
              className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© 2025 Rizal Memorial Institute of Dapitan City, Inc.</p>
      </footer>
    </div>
  );
}
