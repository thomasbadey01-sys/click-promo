import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Feed from './pages/Feed';
import OffreDetail from './pages/OffreDetail';
import Carte from './pages/Carte';
import Favoris from './pages/Favoris';
import Dashboard from './pages/Dashboard';
import Profil from './pages/Profil';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
