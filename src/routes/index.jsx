import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Location from '../pages/Location';
import Home from '../pages/Home';
import About from '../pages/About';
import Courses from '../pages/Courses';
import CourseDetails from '../pages/CourseDetails';
import Teachers from '../pages/Teachers';
import Reviews from '../pages/Reviews';
import Blog from '../pages/Blog';
import BlogDetails from '../pages/BlogDetails';
import Gallery from '../pages/Gallery';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import Registration from '../pages/Registration';
import Quiz from '../pages/Quiz';
import NotFound from '../pages/NotFound';

// Admin pages
import AdminLogin from '../pages/admin/Login';
import AdminApplications from '../pages/admin/Applications';
import AdminCourses from '../pages/admin/Courses';
import AdminTeachers from '../pages/admin/Teachers';
import AdminBranches from '../pages/admin/Branches';
import AdminBlog from '../pages/admin/Blog';
import AdminReviews from '../pages/admin/Reviews';
import AdminSettings from '../pages/admin/Settings';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/:id', element: <CourseDetails /> },
      { path: 'teachers', element: <Teachers /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:id', element: <BlogDetails /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'location', element: <Location /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'registration', element: <Registration /> },
      { path: 'quiz', element: <Quiz /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // Admin routes
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminApplications /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'courses', element: <AdminCourses /> },
      { path: 'teachers', element: <AdminTeachers /> },
      { path: 'branches', element: <AdminBranches /> },
      { path: 'blog', element: <AdminBlog /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
]);