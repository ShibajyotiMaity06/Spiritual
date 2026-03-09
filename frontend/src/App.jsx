import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GenericLanding from './pages/GenericLanding';
import HinduLanding from './pages/HinduLanding';
import QuranLanding from './pages/QuranLanding';
import BibleLanding from './pages/BibleLanding';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GenericLanding />} />
        <Route path="/gita" element={<HinduLanding />} />
        <Route path="/quran" element={<QuranLanding />} />
        <Route path="/bible" element={<BibleLanding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
