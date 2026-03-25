import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Carte from './pages/Carte';
import Dashboard from './pages/Dashboard';
import Favoris from './pages/Favoris';
import Feed from './pages/Feed';
import Home from './pages/Home';
import OffreDetail from './pages/OffreDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profil from './pages/Profil';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
