import { Navigate } from "react-router-dom";
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    if (!AuthService.isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;

