# QRAMS - QR Code-Based Attendance Management System

**Rizal Memorial Institute of Dapitan City, Inc.**  
**School Year 2025-2026**

## Overview

QRAMS is a web-based QR Code Attendance System for tracking student attendance during school events. Features include student registration, event management, QR code generation/scanning, and real-time attendance monitoring.

## Tech Stack

- **Frontend**: Next.js 16 (JavaScript)
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Authentication + Firestore)
- **QR Code**: qrcode + html5-qrcode

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password Authentication**
3. Enable **Firestore Database**
4. Create an admin user in Authentication > Users
5. Deploy security rules from `firestore.rules`

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the System
- **Home**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login
- **QR Scanner**: http://localhost:3000/scan

## Project Structure

```
qrams/
├── app/                    # Next.js pages
│   ├── dashboard/          # Admin dashboard
│   ├── students/           # Student management
│   ├── events/             # Event management
│   ├── scan/               # QR scanning (public)
│   └── attendance/         # Attendance reports
├── components/             # Reusable components
├── contexts/               # React contexts
├── lib/                    # Firebase & utilities
└── firestore.rules         # Security rules
```

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete system documentation including:
- Database schema
- Security rules
- Code snippets
- Workflow guides

## Support

Contact the IT Department of Rizal Memorial Institute of Dapitan City, Inc.

---

** 2025 Rizal Memorial Institute of Dapitan City, Inc.**
