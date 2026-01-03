# QRAMS - QR Code-Based Attendance Management System

## Rizal Memorial Institute of Dapitan City, Inc.
### School Year 2025-2026

---

## 📌 System Overview

QRAMS (QR Code-Based Attendance Management System) is a web-based application designed to automate student attendance during school events using QR codes. The system ensures accuracy, efficiency, and real-time monitoring of student attendance.

### Key Features
- **Student Registration** - Register and manage student records
- **Event Management** - Create and manage school events with attendance sessions
- **QR Code Generation** - Generate unique QR codes for Sign-In and Sign-Out
- **QR Code Scanning** - Camera-based scanning for attendance recording
- **Attendance Logging** - Automatic recording with timestamps and status
- **Real-time Monitoring** - Live attendance tracking and reporting
- **Export Reports** - Download attendance data as CSV

---

## ⚙️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 (JavaScript) |
| Styling | Tailwind CSS 4 |
| Backend | Firebase |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| QR Generation | qrcode (npm) |
| QR Scanning | html5-qrcode |
| Icons | Lucide React |

---

## 📁 Project Structure

```
qrams/
├── app/
│   ├── layout.js              # Root layout with AuthProvider
│   ├── page.js                # Landing page
│   ├── globals.css            # Global styles
│   ├── login/
│   │   └── page.js            # Admin login page
│   ├── dashboard/
│   │   └── page.js            # Admin dashboard
│   ├── students/
│   │   ├── page.js            # Students list
│   │   ├── new/
│   │   │   └── page.js        # Add new student
│   │   └── [id]/
│   │       ├── page.js        # Student details
│   │       └── edit/
│   │           └── page.js    # Edit student
│   ├── events/
│   │   ├── page.js            # Events list
│   │   ├── new/
│   │   │   └── page.js        # Create new event
│   │   └── [id]/
│   │       ├── page.js        # Event details & attendance
│   │       ├── edit/
│   │       │   └── page.js    # Edit event
│   │       └── qr/
│   │           └── page.js    # QR codes for event
│   ├── scan/
│   │   └── page.js            # Public QR scanning page
│   └── attendance/
│       └── page.js            # Attendance reports
├── components/
│   ├── Navbar.js              # Navigation bar
│   ├── StudentForm.js         # Student registration form
│   ├── EventForm.js           # Event creation form
│   ├── QRCodeGenerator.js     # QR code generator component
│   ├── QRCodeScanner.js       # QR code scanner component
│   └── AttendanceTable.js     # Attendance data table
├── contexts/
│   └── AuthContext.js         # Authentication context
├── lib/
│   ├── firebase.js            # Firebase configuration
│   └── firestore.js           # Firestore database operations
├── firestore.rules            # Firestore security rules
└── package.json               # Dependencies
```

---

## 📊 Firestore Database Schema

### Collections

#### 1. `students`
```javascript
{
  studentId: "2025-00001",        // Unique student ID
  firstName: "Juan",
  lastName: "Dela Cruz",
  middleName: "Santos",
  email: "juan@rmi.edu.ph",
  course: "Bachelor of Science in Information Technology",
  yearLevel: "1st Year",
  section: "A",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. `events`
```javascript
{
  title: "Foundation Day 2025",
  description: "Annual foundation day celebration",
  eventDate: "2025-03-15",        // YYYY-MM-DD format
  venue: "RMI Gymnasium",
  signInStart: "07:00",           // HH:MM format
  signInEnd: "08:00",
  signOutStart: "16:00",
  signOutEnd: "17:00",
  gracePeriodMinutes: 15,         // Late threshold
  status: "upcoming",             // upcoming, ongoing, completed, cancelled
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. `attendance`
```javascript
{
  eventId: "abc123",              // Reference to event
  eventTitle: "Foundation Day 2025",
  studentId: "2025-00001",        // Student ID
  studentName: "Juan Dela Cruz",
  type: "sign-in",                // sign-in or sign-out
  timestamp: Timestamp,
  createdAt: Timestamp
}
```

---

## 🔐 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.email != null;
    }
    
    // Students - public read, admin write
    match /students/{studentId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Events - public read, admin write
    match /events/{eventId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Attendance - public read/create, admin update/delete
    match /attendance/{attendanceId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase account
- Git (optional)

### Step 1: Clone/Download the Project
```bash
cd c:\Users\Killuwhe\Desktop\qrams
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (qrams-df915)
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set location to nearest region
5. Deploy Security Rules:
   - Go to Firestore > Rules
   - Copy contents from `firestore.rules`
   - Publish rules

### Step 4: Create Admin Account

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter admin email and password
4. This account will be used to log in to the admin panel

### Step 5: Run the Application
```bash
npm run dev
```

### Step 6: Access the System
- **Landing Page**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login
- **QR Scanner**: http://localhost:3000/scan

---

## 📱 System Workflow

### For Administrators

1. **Login** to the admin panel
2. **Register Students** with their details
3. **Create Events** with sign-in/sign-out schedules
4. **Generate QR Codes** for each event
5. **Print/Display** QR codes at the event venue
6. **Monitor Attendance** in real-time
7. **Export Reports** as needed

### For Students

1. Open the QRAMS website on mobile device
2. Click "Scan QR Code to Attend"
3. Allow camera access
4. Scan the Sign-In QR code
5. Enter Student ID
6. Receive confirmation
7. Repeat for Sign-Out

---

## 🔑 Key Code Snippets

### Firebase Configuration (`lib/firebase.js`)
```javascript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

### QR Code Generation (`components/QRCodeGenerator.js`)
```javascript
import QRCode from 'qrcode';

// Generate QR code data
const data = JSON.stringify({
  eventId: eventId,
  type: 'sign-in', // or 'sign-out'
  timestamp: new Date().toISOString()
});

// Render to canvas
QRCode.toCanvas(canvasRef.current, data, {
  width: 300,
  margin: 2,
  color: { dark: '#1e40af', light: '#ffffff' }
});
```

### QR Code Scanning (`app/scan/page.js`)
```javascript
import { Html5QrcodeScanner } from 'html5-qrcode';

const scanner = new Html5QrcodeScanner('qr-reader', {
  fps: 10,
  qrbox: { width: 250, height: 250 }
});

scanner.render((decodedText) => {
  const data = JSON.parse(decodedText);
  // Process attendance
}, (error) => {
  // Handle error
});
```

### Attendance Recording (`lib/firestore.js`)
```javascript
export async function recordAttendance(attendanceData) {
  // Check for duplicate
  const existing = await getAttendanceRecord(
    attendanceData.eventId,
    attendanceData.studentId,
    attendanceData.type
  );
  
  if (existing) {
    throw new Error('Already recorded');
  }
  
  // Record attendance
  const docRef = await addDoc(collection(db, 'attendance'), {
    ...attendanceData,
    timestamp: serverTimestamp()
  });
  
  return docRef.id;
}
```

---

## 📋 Attendance Status Logic

| Status | Condition |
|--------|-----------|
| **Complete** | Both Sign-In and Sign-Out recorded |
| **Late (Complete)** | Sign-In after grace period, Sign-Out recorded |
| **Incomplete (No Sign-Out)** | Sign-In recorded, no Sign-Out |
| **Incomplete (No Sign-In)** | Sign-Out recorded, no Sign-In |
| **Late (Incomplete)** | Sign-In after grace period, no Sign-Out |
| **Absent** | No Sign-In and no Sign-Out |

---

## 🛠️ Troubleshooting

### Camera not working
- Ensure HTTPS is used (required for camera access)
- Check browser permissions
- Try a different browser

### QR Code not scanning
- Ensure good lighting
- Hold device steady
- Clean camera lens

### Firebase errors
- Check Firebase configuration
- Verify security rules are deployed
- Check network connection

---

## 📞 Support

For technical support, contact the IT Department of Rizal Memorial Institute of Dapitan City, Inc.

---

**© 2025 Rizal Memorial Institute of Dapitan City, Inc.**
**QR Code-Based Attendance Management System (QRAMS)**
