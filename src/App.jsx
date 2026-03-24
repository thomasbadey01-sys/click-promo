import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Abonnement from './pages/Abonnement';
import Home from './pages/Home';
import Carte from './pages/Carte';
import OffreDetail from './pages/OffreDetail';
import Favoris from './pages/Favoris';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Feed from './pages/Feed';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
