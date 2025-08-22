# GeneCura Frontend

A React-based frontend application for the GeneCura genetic drug response analysis system.

## Overview

GeneCura is a role-based web application that analyzes how genetic differences affect drug response. The frontend provides secure, role-specific interfaces for Doctors, Clinical Geneticists, Clinical Pharmacologists, and Administrators.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication forms
│   ├── admin/           # Admin-specific components
│   ├── common/          # Shared components (reports, analysis)
│   ├── dashboard/       # Dashboard layouts and home pages
│   ├── doctor/          # Doctor-specific components
│   ├── geneticist/      # Geneticist-specific components
│   ├── pharmacologist/  # Pharmacologist-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── pages/               # Page components and dashboards
├── services/            # API services and utilities
├── utils/               # Utility functions and validation schemas
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css            # Global styles and Tailwind directives
```

## Key Features

### Authentication & Authorization
- Role-based authentication (Doctor, Geneticist, Pharmacologist, Admin)
- Secure JWT token management with httpOnly cookies
- Role-specific dashboards and navigation
- Protected routes with permission checking

### Doctor Portal
- **Patient Management** - CRUD operations for patient records
- **Prescription Management** - Create and manage prescriptions
- **Report Management** - Upload and manage medical reports
- **Treatment Analysis** - View treatment effectiveness data

### Clinical Geneticist Portal
- **Gene Management** - CRUD operations for genetic data
- **Metabolizer Details** - Manage metabolizer status and variations
- **Report Management** - Upload and manage genetic analysis reports
- **Treatment Analysis** - View genetic treatment correlations

### Clinical Pharmacologist Portal
- **Medicine Management** - CRUD operations for pharmaceutical data
- **Drug Variation Analysis** - Track changes and audit history
- **Report Management** - Upload and manage pharmacological reports
- **Treatment Analysis** - View drug effectiveness data

### Administrative Portal
- **Report Reviews** - Approve/reject submitted reports
- **System Dashboard** - Monitor platform activity and health
- **User Management** - Manage user accounts and permissions

## Component Architecture

### Layout Components
- `DashboardLayout` - Main dashboard wrapper with navigation
- `ProtectedRoute` - Route protection based on user roles

### Common Components
- `DataTable` - Reusable table with sorting, filtering, and pagination
- `LoadingSpinner` - Loading indicators
- `TreatmentAnalysis` - Shared treatment analysis component
- `ReportManagement` - Role-agnostic report management

### Forms & Validation
- Zod schemas for client-side validation
- React Hook Form for form state management
- Role-specific signup and login forms

## API Integration

The frontend integrates with a REST API backend through:
- Axios interceptors for automatic token management
- React Query for data fetching, caching, and synchronization
- Centralized API service modules in `src/services/`

### API Endpoints
- Authentication: `/auth/{role}/login`, `/auth/{role}/signup`
- Patients: `/patients` (Doctor only)
- Genes: `/genes` (Geneticist only)
- Medicines: `/medicines` (Pharmacologist only)
- Reports: `/reports` (All roles)
- Treatment Analysis: `/treatment-cases` (Read-only)
- Admin: `/admin/reports` (Admin only)

## State Management

- **React Query** for server state management
- **React Context** for authentication state
- **Local state** with useState for component-specific data
- **Form state** managed by React Hook Form

## Styling

The application uses Tailwind CSS with:
- Custom component classes defined in `index.css`
- Responsive design for mobile and desktop
- Consistent color scheme and spacing
- Accessible focus states and keyboard navigation

### Custom CSS Classes
- `.btn`, `.btn-primary`, `.btn-secondary` - Button variants
- `.form-input`, `.form-select`, `.form-textarea` - Form controls
- `.card`, `.card-header`, `.card-body` - Card layouts
- `.table`, `.table-header`, `.table-cell` - Table styling

## Development

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api/v1
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security Features

- JWT tokens stored in httpOnly cookies
- Automatic token refresh handling
- Role-based route protection
- Input validation and sanitization
- CSRF protection considerations
- Secure API communication

## Accessibility

- WCAG AA compliance considerations
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and roles
- High contrast color ratios

## Performance

- Code splitting with React.lazy (future enhancement)
- React Query caching for reduced API calls
- Optimized bundle size with Vite
- Image optimization considerations
- Lazy loading for large datasets

## Future Enhancements

- Real-time notifications
- Advanced data visualization
- Bulk operations
- Export functionality
- Advanced search and filtering
- Multi-language support (i18n ready)

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2015+ features
- CSS Grid and Flexbox support required

## License

This project is part of the GeneCura system - Version 1.0
