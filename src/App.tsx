import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SessionProvider } from './state/SessionContext';
import { Home } from './pages/Home';
import { Topic } from './pages/Topic';
import { Act1P1, Act1P2 } from './pages/my/Act1';
import { Act2P1, Act2P2 } from './pages/my/Act2';
import { Act3P1 } from './pages/my/Act3';
import { Act4P1, Act4P2, Act4P3 } from './pages/my/Act4';
import { Act5P1, Talk } from './pages/my/Act5';
import { Measure } from './pages/Measure';
import { Results } from './pages/Results';
import { Library } from './pages/Library';
import { Teacher } from './pages/Teacher';
import { Diagnostics } from './pages/Diagnostics';

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/topic" element={<Topic />} />
            <Route path="/my" element={<Navigate to="/my/1/1" replace />} />
            <Route path="/my/1/1" element={<Act1P1 />} />
            <Route path="/my/1/2" element={<Act1P2 />} />
            <Route path="/my/2/1" element={<Act2P1 />} />
            <Route path="/my/2/2" element={<Act2P2 />} />
            <Route path="/my/3/1" element={<Act3P1 />} />
            <Route path="/my/4/1" element={<Act4P1 />} />
            <Route path="/my/4/2" element={<Act4P2 />} />
            <Route path="/my/4/3" element={<Act4P3 />} />
            <Route path="/my/5/1" element={<Act5P1 />} />
            <Route path="/my/talk" element={<Talk />} />
            <Route path="/measure" element={<Measure />} />
            <Route path="/results" element={<Results />} />
            <Route path="/library" element={<Library />} />
            <Route path="/teacher" element={<Teacher />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </SessionProvider>
  );
}
