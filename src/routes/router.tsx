import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import { Profile } from '../pages/Profile';

type Route = {
  path: string;
  element: React.ReactNode;
};

const routes: Route[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
];

const router = createBrowserRouter(routes);

export default router;
