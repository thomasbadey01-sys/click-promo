import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import OffreDetail from './pages/OffreDetail';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import Carte from './pages/Carte';
import Feed from './pages/Feed';
import Abonnement from './pages/Abonnement';
import Favoris from './pages/Favoris';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Favoris" element={<Favoris />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
