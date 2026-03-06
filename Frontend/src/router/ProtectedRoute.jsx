import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Determine redirect path based on requested role context
        let loginPath = '/employee/login'; // Default

        // This is a heuristic. Ideally, we know which section we are protecting.
        // If allowedRoles contains strict one-role array, we can guess.
        if (allowedRoles && allowedRoles.includes('superadmin')) {
            loginPath = '/superadmin/login';
        } else if (allowedRoles && allowedRoles.includes('admin')) {
            loginPath = '/admin/login';
        } else if (allowedRoles && allowedRoles.includes('manager')) {
            loginPath = '/manager/login';
        } else if (allowedRoles && (allowedRoles.includes('sales') || allowedRoles.includes('sales_executive'))) {
            loginPath = '/sales/login';
        }

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard if role is not allowed
        const defaultRoute = role === 'superadmin'
            ? '/superadmin'
            : role === 'admin'
                ? '/admin'
                : role === 'manager'
                    ? '/manager'
                    : (role === 'sales' || role === 'sales_executive')
                        ? '/sales'
                        : '/employee';

        return <Navigate to={defaultRoute} replace />;
    }

    return children;
};

export default ProtectedRoute;
