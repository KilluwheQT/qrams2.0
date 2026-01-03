'use client';

import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { timestampToDate, formatTime } from '@/lib/firestore';

export default function AttendanceTable({ records, event }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'complete' && (record.status === 'Complete' || record.status === 'Late (Complete)')) ||
      (statusFilter === 'incomplete' && record.status.includes('Incomplete')) ||
      (statusFilter === 'absent' && record.status === 'Absent') ||
      (statusFilter === 'late' && record.status.includes('Late'));
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'Complete': 'bg-green-100 text-green-800',
      'Late (Complete)': 'bg-yellow-100 text-yellow-800',
      'Incomplete (No Sign-Out)': 'bg-orange-100 text-orange-800',
      'Incomplete (No Sign-In)': 'bg-orange-100 text-orange-800',
      'Late (Incomplete)': 'bg-red-100 text-red-800',
      'Absent': 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Course', 'Year', 'Section', 'Sign-In', 'Sign-Out', 'Status'];
    const rows = filteredRecords.map(r => [
      r.studentId,
      `${r.lastName}, ${r.firstName}`,
      r.course,
      r.yearLevel,
      r.section,
      r.signIn ? formatTime(timestampToDate(r.signIn.timestamp)) : 'N/A',
      r.signOut ? formatTime(timestampToDate(r.signOut.timestamp)) : 'N/A',
      r.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${event?.title || 'report'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
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
                Course / Year / Section
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sign-In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sign-Out
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {record.studentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.lastName}, {record.firstName} {record.middleName || ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{record.course}</div>
                    <div className="text-xs">{record.yearLevel} - Section {record.section}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {record.signIn ? formatTime(timestampToDate(record.signIn.timestamp)) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {record.signOut ? formatTime(timestampToDate(record.signOut.timestamp)) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  );
}
