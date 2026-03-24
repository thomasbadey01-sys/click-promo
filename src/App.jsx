import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Favoris from './pages/Favoris';
import Home from './pages/Home';
import Profil from './pages/Profil';
import OffreDetail from './pages/OffreDetail';
import Dashboard from './pages/Dashboard';
import Carte from './pages/Carte';
import Feed from './pages/Feed';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
