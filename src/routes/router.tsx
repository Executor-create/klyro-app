import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import { Profile } from '../pages/Profile';
import RequireAuth from '../components/RequireAuth';
import OTP from '../pages/OTP';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/otp',
    element: <OTP />,
  },
  {
    element: (
      <AuthProvider>
        <RequireAuth />
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
]);

export default router;
