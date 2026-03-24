import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Favoris from './pages/Favoris';
import Carte from './pages/Carte';
import Profil from './pages/Profil';
import Login from './pages/Login';
import OffreDetail from './pages/OffreDetail';
import Admin from './pages/Admin';
import Feed from './pages/Feed';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import Abonnement from './pages/Abonnement';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
