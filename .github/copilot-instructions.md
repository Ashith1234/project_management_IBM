# Project Management App - AI Coding Guidelines

## Architecture Overview
This is a full-stack MERN (MongoDB, Express, React, Node.js) project management application with role-based access control.

**Backend Structure:**
- Express server with Socket.io for real-time updates
- Mongoose models: User, Project, Task, Timesheet, Organization, etc.
- JWT authentication with role-based middleware (`protect`, `authorize`)
- API routes under `/api/*` with RESTful patterns

**Frontend Structure:**
- React 18 with Vite build tool
- React Router for navigation with protected routes
- Tailwind CSS for styling with custom UI components
- Axios for API calls with automatic JWT header injection
- Role-specific dashboards (admin, project_manager, team_lead, member)

**Database:**
- MongoDB with Docker Compose setup
- User roles: admin, project_manager, team_lead, member
- Projects have managers, members, and belong to organizations

## Development Workflow
- **Start development:** `npm run dev` (runs server and client concurrently)
- **Run backend only:** `npm run server` (uses nodemon)
- **Run frontend only:** `npm run client` (Vite dev server)
- **Seed database:** `npm run seed`
- **Install dependencies:** `npm run install-all`
- **Start MongoDB:** `docker-compose up -d`

## Key Patterns & Conventions

### Authentication & Authorization
- Use `useAuth()` hook for user state and token management
- JWT stored in localStorage, automatically added to Axios headers
- Protect routes with `protect` middleware, authorize with `authorize('role1', 'role2')`
- Role-based UI rendering in components (e.g., Dashboard switches on `user.role`)

### API Communication
- All API calls via Axios with base URL proxied to backend
- Error handling with `react-hot-toast` for user feedback
- Real-time updates via Socket.io (join project rooms with `socket.emit('join_project', projectId)`)

### UI Components
- Use `@/components/ui/*` components with variant props (e.g., `<Button variant="primary" size="md">`)
- Class merging with `clsx` and `tailwind-merge` for conditional styling
- Consistent loading states with `isLoading` prop and spinner SVG
- Form handling with `react-hook-form` + Zod validation

### Data Models
- Projects: status (`planning`, `active`, `on_hold`, `completed`, `cancelled`), priority (`low`, `medium`, `high`, `urgent`)
- Tasks: status (`todo`, `in_progress`, `review`, `done`), type (`task`, `bug`, `feature`)
- Users belong to organizations, projects have managers and members

### File Organization
- Backend: Controllers handle business logic, routes define endpoints
- Frontend: Pages in `/pages/*`, reusable components in `/components/*`
- Import alias: `@` resolves to `./src` in client
- Models use Mongoose with pre-save hooks for password hashing

### Error Handling
- Backend: `express-async-handler` for async route errors
- Frontend: Try-catch with toast notifications for API errors
- Validation: Zod schemas for form and API validation

## Common Tasks
- **Add new API endpoint:** Create controller method, add to routes with appropriate middleware
- **Add new page:** Create component in `/pages/*`, add route in `App.jsx` with layout wrapper
- **Add UI component:** Follow Button.jsx pattern with variants, sizes, forwardRef
- **Role-specific feature:** Check `user.role` in component or use authorize middleware
- **Real-time feature:** Emit events from backend, listen in frontend with Socket.io client

## Dependencies to Know
- **Backend:** mongoose, bcryptjs, jsonwebtoken, socket.io, zod, express-validator
- **Frontend:** react-router-dom, axios, react-hook-form, tailwindcss, framer-motion, recharts, socket.io-client