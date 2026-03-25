import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Carte from './pages/Carte';
import Abonnement from './pages/Abonnement';
import Favoris from './pages/Favoris';
import OffreDetail from './pages/OffreDetail';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Profil from './pages/Profil';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
