# PitchPro Admin Dashboard

A modern React-based admin dashboard for sports facility management, migrated from FlutterFlow to provide better performance and maintainability.

## 🏗️ Architecture

Built with modern React ecosystem and Firebase backend:

- **Frontend**: React 18+ with TypeScript, Tailwind CSS
- **State Management**: React Query for server state, React Context for client state
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, Storage)
- **UI Components**: Custom components with Headless UI and Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

## 🚀 Features

- **Multi-tenant Organization Management**: Switch between different sports facilities
- **Real-time Dashboard**: KPI cards, revenue charts, booking analytics  
- **Calendar Management**: Weekly view with session scheduling
- **Session Management**: Book, confirm, reschedule, and manage sports sessions
- **Group Management**: Permanent session groups with contribution tracking
- **Financial Management**: Transaction history, withdrawal requests, M-Pesa integration
- **Role-based Access Control**: Admin authentication with Firebase Auth
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📱 Pages

1. **Dashboard** (`/`): KPI cards, revenue charts, booking overview
2. **Calendar** (`/calendar`): Weekly calendar view with session blocks
3. **Analytics** (`/analytics`): Detailed analytics with donut charts
4. **Sessions** (`/sessions`): Session management table with search/filters
5. **Groups** (`/groups`): Permanent session groups management
6. **Finances** (`/finances`): Transaction history and financial management

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore, Auth, and Cloud Functions enabled

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Update the following environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_ALGOLIA_APP_ID=your_algolia_app_id_here
VITE_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎨 Design System

### Colors

- **Primary Brand**: `#4A7C59` (sidebar background)
- **Success Green**: `#22C55E` (confirmed badges)
- **Danger Red**: `#EF4444` (withdrawal badges)
- **Warning Orange**: `#F97316` (active nav items)

### Layout Specifications

- **Sidebar**: Fixed 208px width
- **Header**: 64px height
- **Main Content**: `calc(100vw - 208px)` with 24px padding
- **Typography**: Inter font family

## 📊 Firebase Integration

### Collections (18 Total)
- `users`, `organizations`, `sessions`, `PermanentSessions`
- `sessionCalendar`, `transactions`, `cities`, `logs`
- `withdrawalRequests`, `transactionCost`, `organizationStats`
- Plus 6 subcollections for pitches, wallets, notifications

### Cloud Functions (24 Functions)
- **asia-south1**: 16 functions
- **europe-west1**: 1 function  
- **default**: 7 functions

All integrated with proper error handling and React Query cache management.

## 🔒 Authentication

- Firebase Authentication with role validation
- Protected routes with admin access control
- Organization context management
- Multi-region Cloud Function integration

## 🚀 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Type checking
npm run tsc
```

## 📱 Responsive Design

Mobile-first approach with Tailwind CSS, optimized for all screen sizes with touch-friendly interactions.

---

**Tech Stack**: React 18+ • TypeScript • Tailwind CSS • Firebase • React Query • React Hook Form • Zod