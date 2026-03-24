import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import OffreDetail from './pages/OffreDetail';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Abonnement from './pages/Abonnement';
import Admin from './pages/Admin';
import Feed from './pages/Feed';
import Profil from './pages/Profil';
import Dashboard from './pages/Dashboard';
import Favoris from './pages/Favoris';
import Carte from './pages/Carte';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Carte" element={<Carte />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
