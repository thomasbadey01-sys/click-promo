import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Admin from './pages/Admin';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Carte from './pages/Carte';
import Profil from './pages/Profil';
import Favoris from './pages/Favoris';
import OffreDetail from './pages/OffreDetail';
import Dashboard from './pages/Dashboard';
import Abonnement from './pages/Abonnement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Abonnement" element={<Abonnement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
