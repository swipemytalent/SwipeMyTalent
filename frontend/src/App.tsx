import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Talents from './pages/Talents';
import ProfileView from './pages/ProfileView';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './styles/main.scss';
import Footer from './components/Footer/Footer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { AppDispatch, RootState } from './redux/store';
import { setupHttpService } from './services/httpService';
import MessagingSystem from './components/MessagingSystem/MessagingSystem';
import { closeMessaging } from './redux/messagingSlice';
import NotificationPermission from './components/NotificationPermission/NotificationPermission';
import CGU from './pages/CGU';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import ForumDiscord from './pages/ForumDiscord';

const ExchangeDetail = () => <div style={{padding:40, textAlign:'center'}}>Détail de l'échange (à implémenter)</div>;

const AppContent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const messaging = useSelector((state: RootState) => state.messaging);

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
        <Route path="/echanges/:id" element={<ProtectedRoute><ExchangeDetail /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><ForumDiscord /></ProtectedRoute>} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/confidentialite" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <MessagingSystem
        isOpen={messaging.isOpen}
        selectedUserId={messaging.selectedUserId}
        onClose={() => dispatch(closeMessaging())}
      />
      <NotificationPermission />
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