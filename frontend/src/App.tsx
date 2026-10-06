import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Analytics from './pages/Analytics';
import Upload from './pages/Upload';
import History from './pages/History';
import About from './pages/About';

function App() {
  return (
    <Router>
      {/* Ambient background — fixed, behind everything */}
      <div className="ambient-bg" aria-hidden="true" />

      <div className="min-h-screen relative flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="border-t border-border mt-auto py-5 px-6">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-textMuted">
            <span>© 2026 Customer Churn Prediction Platform. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-textMuted">All systems operational</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
