'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentAttendance, getEventById, timestampToDate, formatDateTime } from '@/lib/firestore';
import { QrCode, User, Calendar, LogOut, ClipboardList, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import QRLoader from '@/components/QRLoader';
import Link from 'next/link';

export default function StudentPortalPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    signIns: 0,
    signOuts: 0
  });

  useEffect(() => {
    const session = sessionStorage.getItem('studentSession');
    if (!session) {
      router.replace('/student/login');
      return;
    }

    const studentData = JSON.parse(session);
    setStudent(studentData);
    loadAttendance(studentData.studentId);
  }, []);

  const loadAttendance = async (studentId) => {
    try {
      const records = await getStudentAttendance(studentId);
      
      // Group by event and enrich with event details
      const eventMap = new Map();
      
      for (const record of records) {
        if (!eventMap.has(record.eventId)) {
          const event = await getEventById(record.eventId);
          eventMap.set(record.eventId, {
            event,
            signIn: null,
            signOut: null
          });
        }
        
        if (record.type === 'sign-in') {
          eventMap.get(record.eventId).signIn = record;
        } else {
          eventMap.get(record.eventId).signOut = record;
        }
      }

      const attendanceList = Array.from(eventMap.values()).map(item => ({
        ...item,
        status: item.signIn && item.signOut ? 'Complete' : 
                item.signIn ? 'Incomplete (No Sign-Out)' : 
                item.signOut ? 'Incomplete (No Sign-In)' : 'Unknown'
      }));

      // Calculate stats
      const signIns = records.filter(r => r.type === 'sign-in').length;
      const signOuts = records.filter(r => r.type === 'sign-out').length;
      const complete = attendanceList.filter(a => a.status === 'Complete').length;
      const incomplete = attendanceList.filter(a => a.status.includes('Incomplete')).length;

      setStats({
        total: attendanceList.length,
        complete,
        incomplete,
        signIns,
        signOuts
      });

      setAttendance(attendanceList);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studentSession');
    router.push('/student/login');
  };

  if (!student || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <QRLoader size="lg" />
        <p className="mt-4 text-gray-600 text-sm">Loading portal...</p>
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
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-3 sm:p-4 bg-green-100 rounded-full">
                <User className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-800">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-sm text-gray-500">{student.studentId}</p>
              </div>
            </div>
            <div className="flex-1 hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-800">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-500">{student.studentId}</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>{student.gradeLevel}{student.strand ? ` - ${student.strand}` : ''}</p>
                <p>Section {student.section}</p>
              </div>
            </div>
            <div className="flex sm:hidden text-sm text-gray-600 -mt-2">
              <p>{student.gradeLevel}{student.strand ? ` - ${student.strand}` : ''} • Section {student.section}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                href="/student/profile/edit"
                className="flex items-center justify-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Edit className="h-5 w-5" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/scan"
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <QrCode className="h-5 w-5" />
                <span>Scan QR</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-500">Events</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.complete}</p>
            <p className="text-xs sm:text-sm text-gray-500">Complete</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.incomplete}</p>
            <p className="text-xs sm:text-sm text-gray-500">Incomplete</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center">
            <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.signIns}</p>
            <p className="text-xs sm:text-sm text-gray-500">Sign-Ins</p>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Attendance History</h2>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No attendance records yet</p>
              <Link href="/scan" className="text-green-600 hover:underline text-sm mt-2 inline-block">
                Scan a QR code to record attendance
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attendance.map((record, index) => (
                <div key={index} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {record.event?.title || 'Unknown Event'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {record.event?.eventDate} • {record.event?.venue}
                      </p>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      record.status === 'Complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status === 'Complete' ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${record.signIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 truncate">
                        In: {record.signIn 
                          ? formatDateTime(timestampToDate(record.signIn.timestamp))
                          : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${record.signOut ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 truncate">
                        Out: {record.signOut 
                          ? formatDateTime(timestampToDate(record.signOut.timestamp))
                          : 'Not recorded'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© 2025 Rizal Memorial Institute of Dapitan City, Inc.</p>
      </footer>
    </div>
  );
}
