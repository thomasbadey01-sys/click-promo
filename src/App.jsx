import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Carte from './pages/Carte';
import Favoris from './pages/Favoris';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profil from './pages/Profil';
import Dashboard from './pages/Dashboard';
import OffreDetail from './pages/OffreDetail';
import Feed from './pages/Feed';
import Abonnement from './pages/Abonnement';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
