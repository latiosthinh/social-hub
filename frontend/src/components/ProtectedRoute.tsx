import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
    const isAuthenticated = !!localStorage.getItem('auth_token');
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
