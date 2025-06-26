import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Talents from './pages/Talents';
import ProfileView from './pages/ProfileView';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.scss';
import Footer from './components/Footer';
import { Provider, useDispatch } from 'react-redux';
import store, { AppDispatch } from './redux/store';
import { setupHttpService } from './services/httpService';

const AppContent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    setupHttpService(dispatch);
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/comment-ca-marche" element={<HowItWorks />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/talents" element={<ProtectedRoute><Talents /></ProtectedRoute>} />
        <Route path="/profil/:id" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;    