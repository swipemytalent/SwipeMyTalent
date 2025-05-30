import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Talents from './pages/Talents';
import ProfileView from './pages/ProfileView';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.scss';
import Footer from './components/Footer';
import { Provider } from 'react-redux';
import store from './redux/store';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/talents" element={<ProtectedRoute><Talents /></ProtectedRoute>} />
          <Route path="/profil/:id" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </Router>
    </Provider>
  );
}

export default App;    