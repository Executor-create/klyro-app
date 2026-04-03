import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import { Profile } from '../pages/Profile';
import RequireAuth from '../components/RequireAuth';
import OTP from '../pages/OTP';
import ForgotPasswordPage from '../pages/ForgotPassword';
import ResetPasswordPage from '../pages/ResetPassword';
import { GamesPage } from '../pages/Games';
import GameDetail from '../pages/GameDetail';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/otp',
    element: <OTP />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/games',
    element: <GamesPage />,
  },
  {
    path: '/games/:id',
    element: <GameDetail />,
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
