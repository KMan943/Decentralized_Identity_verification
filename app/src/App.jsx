// import './static/App.css'
import Homepage from './pages/Homepage'
import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom'
import MainLayout from './pages/MainLayout';


const App = () => {
  const router = createBrowserRouter([
    {
      path: "/", element: <MainLayout />, children: [
        {
          path: "/",
          element: <Homepage />,
        },
      ]
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App
