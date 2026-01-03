import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// ==================== STUDENTS ====================

export async function addStudent(studentData) {
  // Check for duplicate student ID
  const existingStudent = await getStudentByStudentId(studentData.studentId);
  if (existingStudent) {
    throw new Error('Student ID already exists');
  }
  
  const docRef = await addDoc(collection(db, 'students'), {
    ...studentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getStudentByStudentId(studentId) {
  const q = query(collection(db, 'students'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getStudentById(docId) {
  const docRef = doc(db, 'students', docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getAllStudents() {
  const q = query(collection(db, 'students'), orderBy('lastName', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateStudent(docId, studentData) {
  const docRef = doc(db, 'students', docId);
  await updateDoc(docRef, {
    ...studentData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteStudent(docId) {
  const docRef = doc(db, 'students', docId);
  await deleteDoc(docRef);
}

// ==================== EVENTS ====================

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, 'events'), {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getEventById(eventId) {
  const docRef = doc(db, 'events', eventId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getAllEvents() {
  const q = query(collection(db, 'events'), orderBy('eventDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateEvent(eventId, eventData) {
  const docRef = doc(db, 'events', eventId);
  await updateDoc(docRef, {
    ...eventData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteEvent(eventId) {
  const docRef = doc(db, 'events', eventId);
  await deleteDoc(docRef);
}

// ==================== ATTENDANCE ====================

export async function recordAttendance(attendanceData) {
  // Check if student already has this attendance type for this event
  const existing = await getAttendanceRecord(
    attendanceData.eventId,
    attendanceData.studentId,
    attendanceData.type
  );
  
  if (existing) {
    throw new Error(`Student already ${attendanceData.type === 'sign-in' ? 'signed in' : 'signed out'} for this event`);
  }
  
  const docRef = await addDoc(collection(db, 'attendance'), {
    ...attendanceData,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getAttendanceRecord(eventId, studentId, type) {
  const q = query(
    collection(db, 'attendance'),
    where('eventId', '==', eventId),
    where('studentId', '==', studentId),
    where('type', '==', type)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getEventAttendance(eventId) {
  const q = query(
    collection(db, 'attendance'),
    where('eventId', '==', eventId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getStudentAttendance(studentId) {
  const q = query(
    collection(db, 'attendance'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAttendanceSummary(eventId) {
  const attendance = await getEventAttendance(eventId);
  const event = await getEventById(eventId);
  const students = await getAllStudents();
  
  const signIns = attendance.filter(a => a.type === 'sign-in');
  const signOuts = attendance.filter(a => a.type === 'sign-out');
  
  const summary = students.map(student => {
    const signIn = signIns.find(a => a.studentId === student.studentId);
    const signOut = signOuts.find(a => a.studentId === student.studentId);
    
    let status = 'Absent';
    if (signIn && signOut) {
      status = 'Complete';
    } else if (signIn) {
      status = 'Incomplete (No Sign-Out)';
    } else if (signOut) {
      status = 'Incomplete (No Sign-In)';
    }
    
    // Check if late (signed in after grace period)
    if (signIn && event) {
      const signInTime = signIn.timestamp?.toDate?.() || new Date(signIn.timestamp);
      const eventStart = new Date(`${event.eventDate}T${event.signInStart}`);
      const gracePeriod = (event.gracePeriodMinutes || 15) * 60 * 1000;
      
      if (signInTime > new Date(eventStart.getTime() + gracePeriod)) {
        status = signOut ? 'Late (Complete)' : 'Late (Incomplete)';
      }
    }
    
    return {
      ...student,
      signIn: signIn || null,
      signOut: signOut || null,
      status
    };
  });
  
  return {
    event,
    totalStudents: students.length,
    signedIn: signIns.length,
    signedOut: signOuts.length,
    complete: summary.filter(s => s.status === 'Complete' || s.status === 'Late (Complete)').length,
    incomplete: summary.filter(s => s.status.includes('Incomplete')).length,
    absent: summary.filter(s => s.status === 'Absent').length,
    late: summary.filter(s => s.status.includes('Late')).length,
    records: summary
  };
}

// ==================== UTILITY ====================

export function timestampToDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTime(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
