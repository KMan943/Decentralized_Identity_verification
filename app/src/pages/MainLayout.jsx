import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const MainLayout = () => {
  return (
    <>  
        <div style={layout}>
            <Outlet />
            <ToastContainer />
        </div>
    </>
  );
};

const layout = {
    backgroundColor: 'black',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexdirection: 'column',
    background: 'linear-gradient(135deg,rgb(18, 20, 54) 0%,rgb(12, 52, 2) 100%)',
};

export default MainLayout