import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { DeleteSocialData } from './pages/DeleteSocialData';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/delete-social-data" element={<DeleteSocialData />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
