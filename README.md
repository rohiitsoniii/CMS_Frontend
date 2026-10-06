# 🎨 Headless CMS - Frontend

## Overview

Modern, beautiful admin interface for the Enterprise Headless CMS built with React, TypeScript, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:5000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/                    # Page components
│   │   ├── auth/                # Login, Register
│   │   ├── dashboard/           # Dashboard home
│   │   ├── projects/            # Project management
│   │   ├── content-types/       # Content type builder ✨ NEW
│   │   ├── content/             # Content editor
│   │   ├── media/               # Media library
│   │   ├── analytics/           # Analytics dashboard
│   │   ├── apikeys/             # API key management
│   │   ├── settings/            # Settings
│   │   └── chatbot/             # Knowledge base
│   ├── components/              # Reusable components
│   │   ├── ui/                  # UI primitives (Radix)
│   │   ├── layout/              # Layout components
│   │   └── auth/                # Auth components
│   ├── services/                # API services
│   │   └── contentTypeService.ts ✨ NEW
│   ├── store/                   # State management (Zustand)
│   ├── lib/                     # Utilities
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 Features

### ✅ Implemented

#### Authentication
- Login with email/password
- User registration
- Protected routes
- Auto-redirect for authenticated users

#### Project Management
- Create/edit/delete projects
- Project dashboard
- Project overview with stats

#### Content Type Builder ✨ **NEW**
- Visual content type builder
- 15+ field types
- Field configuration
- Drag-and-drop field ordering
- Validation rules
- Localization support
- Version control
- Beautiful, intuitive UI

#### Media Library
- Upload images and files
- Folder organization
- Search and filters
- Grid/list view

#### API Keys
- Generate API keys
- Manage permissions
- Copy to clipboard

#### Analytics
- Usage statistics
- Charts and graphs
- Real-time data

#### Settings
- User profile
- Project settings
- Preferences

### ⏳ Coming Soon

- Dynamic Content Editor
- Version History Viewer
- Workflow Management
- Content Scheduling
- Localization Management
- Enhanced Media Library

---

## 🎨 Design System

### Colors

```css
/* Primary */
--indigo-500: #6366f1
--indigo-600: #4f46e5
--purple-500: #a855f7
--purple-600: #9333ea

/* Neutral */
--gray-50: #f9fafb
--gray-900: #111827

/* Semantic */
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
```

### Typography

- **Font Family:** Inter (Google Fonts)
- **Headings:** Bold, gradient text
- **Body:** Regular, 16px base

### Components

All components use:
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Subtle shadows
- Smooth transitions
- Hover effects (scale, shadow, color)
- Focus rings for accessibility

---

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### State & Data
- **Zustand** - State management
- **Axios** - HTTP client
- **React Query** - Data fetching (optional)

### Forms
- **React Hook Form** - Form handling
- **Zod** - Schema validation

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### API Base URL

The API base URL is configured in each service file:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## 📚 Key Pages

### Content Type Builder

**Route:** `/dashboard/project/:projectId/content-types`

**Features:**
- List all content types
- Create new content type
- Edit existing content type
- Delete content type
- Search and filter
- Beautiful card layout

**Usage:**
1. Navigate to a project
2. Click "Content Types" in sidebar
3. Click "Create Content Type"
4. Add fields and configure
5. Save

### Content Type Editor

**Route:** `/dashboard/project/:projectId/content-types/new`

**Features:**
- Visual field builder
- 15+ field types
- Real-time configuration
- Validation rules
- Options (timestamps, versioning, localization)

**Field Types:**
- Text, Long Text, Rich Text
- Number, Boolean
- Date, DateTime
- Email, URL
- Media, JSON
- Enumeration
- Relation, Component
- Array

---

## 🎯 Best Practices

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export function MyComponent({ prop }: Props) {
  // 4. Hooks
  const navigate = useNavigate();
  const [state, setState] = useState();

  // 5. Effects
  useEffect(() => {
    // ...
  }, []);

  // 6. Handlers
  const handleClick = () => {
    // ...
  };

  // 7. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Styling Guidelines

1. **Use Tailwind utilities** - Avoid custom CSS
2. **Consistent spacing** - Use `gap-4`, `p-6`, etc.
3. **Responsive design** - Use `md:`, `lg:` breakpoints
4. **Dark mode** - Use `dark:` variants
5. **Hover effects** - Add `hover:` states
6. **Transitions** - Use `transition-all`

### API Service Pattern

```typescript
class MyService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getData(): Promise<Data[]> {
    const response = await axios.get(
      `${API_URL}/endpoint`,
      this.getAuthHeaders()
    );
    return response.data.data;
  }
}

export const myService = new MyService();
```

---

## 🐛 Troubleshooting

### TypeScript Errors

**Problem:** "Cannot find module 'react'"

**Solution:**
```bash
npm install
```

### API Connection Issues

**Problem:** Network errors when calling API

**Solution:**
1. Check backend is running: `http://localhost:5000`
2. Verify `.env` file has correct `VITE_API_URL`
3. Check CORS settings in backend

### Build Errors

**Problem:** Build fails with TypeScript errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Drag and drop 'dist' folder to Netlify
```

---

## 📖 Documentation

### Component Documentation

Each major component has inline comments explaining:
- Purpose
- Props
- Usage examples
- Edge cases

### API Documentation

See `docs/API-TESTING-GUIDE.md` for backend API documentation.

---

## 🎉 What's New

### v1.1.0 (January 3, 2026)

#### ✨ New Features
- **Content Type Builder** - Visual builder for content types
- **Field Configuration** - Configure 15+ field types
- **Search & Filters** - Find content types quickly
- **Beautiful UI** - Premium design with gradients and animations

#### 🔧 Improvements
- Added TypeScript interfaces for content types
- Improved error handling
- Better loading states
- Enhanced responsive design

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep components focused and small

### Commit Messages

```
feat: Add content type builder
fix: Resolve navigation issue
docs: Update README
style: Format code
refactor: Simplify component logic
```

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Review existing code
3. Check console for errors
4. Review network requests

---

## 🎊 Credits

Built with ❤️ using:
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

---

**Happy Coding! 🚀**
