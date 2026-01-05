'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { getPendingStudents, approveStudent, rejectStudent, timestampToDate, formatDateTime } from '@/lib/firestore';
import { UserCheck, UserX, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import QRLoader, { QRLoaderFullPage } from '@/components/QRLoader';
import Link from 'next/link';

export default function PendingStudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadPendingStudents();
    }
  }, [user]);

  const loadPendingStudents = async () => {
    try {
      const data = await getPendingStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading pending students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error approving student:', error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error rejecting student:', error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  if (authLoading || !user) {
    return <QRLoaderFullPage message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Students
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Pending Registrations</h1>
          <p className="text-gray-600 mt-1">Review and approve student registration requests</p>
        </div>

        {/* Pending Students List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <QRLoader size="md" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p className="text-gray-500">No pending registrations</p>
              <p className="text-sm text-gray-400 mt-1">All student registrations have been processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strand / Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.lastName}, {student.firstName} {student.middleName || ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {student.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {student.gradeLevel}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {student.strand ? `${student.strand} - ${student.section}` : student.section}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDateTime(timestampToDate(student.createdAt))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setConfirmAction({ type: 'approve', student })}
                            disabled={actionLoading === student.id}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'reject', student })}
                            disabled={actionLoading === student.id}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Summary */}
          <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
            {students.length} pending registration{students.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-center mb-4">
                {confirmAction.type === 'approve' ? (
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                {confirmAction.type === 'approve' ? 'Approve Registration' : 'Reject Registration'}
              </h3>
              
              <p className="text-gray-600 mb-4 text-center">
                {confirmAction.type === 'approve' 
                  ? `Are you sure you want to approve ${confirmAction.student.firstName} ${confirmAction.student.lastName}'s registration?`
                  : `Are you sure you want to reject ${confirmAction.student.firstName} ${confirmAction.student.lastName}'s registration? This will delete their application.`
                }
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Student ID:</strong> {confirmAction.student.studentId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Grade Level:</strong> {confirmAction.student.gradeLevel}
                  {confirmAction.student.strand && ` - ${confirmAction.student.strand}`}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction.type === 'approve' 
                    ? handleApprove(confirmAction.student.id)
                    : handleReject(confirmAction.student.id)
                  }
                  disabled={actionLoading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                    confirmAction.type === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading 
                    ? 'Processing...' 
                    : confirmAction.type === 'approve' ? 'Approve' : 'Reject'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
