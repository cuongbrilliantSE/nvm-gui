import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import WindowsNodeVersionManager from './components/WindowsNodeVersionManager';
import './index.css';

function Container() {
  return (
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <WindowsNodeVersionManager />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Container />} />
      </Routes>
    </Router>
  );
}
