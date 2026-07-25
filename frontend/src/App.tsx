import { useState, useEffect } from 'react';
import { 
  Vote, 
  Settings, 
  AlertTriangle,
  Mail
} from 'lucide-react';
import type { Category, Candidate } from './types';
import { VotePage } from './pages/VotePage/VotePage';
import { AdminPage } from './pages/AdminPage/AdminPage';
import './App.css';
import kstsLogo from './assets/ksts-logo.png';


// Dynamic API Base Configuration
const API_BASE = import.meta.env.DEV
  ? `http://${window.location.hostname}:1234` 
  : window.location.origin;

function App() {
  // Navigation State: 'vote' | 'admin'
  const [activeTab, setActiveTab] = useState<'vote' | 'admin'>('vote');

  // Global Data Cache
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [catRes, candRes] = await Promise.all([
        fetch(`${API_BASE}/api/categories/`),
        fetch(`${API_BASE}/api/individuals/`)
      ]);

      if (!catRes.ok || !candRes.ok) {
        throw new Error('Failed to load categories or candidates from API.');
      }

      const catData = await catRes.json();
      const candData = await candRes.json();

      setCategories(catData);
      setCandidates(candData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Navigation Bar */}
      <header className="navbar">
        <div className="app-container navbar-content" style={{ padding: '0 16px' }}>
          <button 
            type="button"
            className="brand" 
            onClick={() => setActiveTab('vote')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <img 
              src={kstsLogo} 
              alt="KSTS Logo" 
              style={{ 
                height: '32px', 
                width: '32px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))'
              }} 
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>KsTS Ballot System</span>
          </button>
          
          <nav className="nav-links">
            <button 
              type="button"
              className={`nav-btn ${activeTab === 'vote' ? 'active' : ''}`}
              onClick={() => setActiveTab('vote')}
            >
              <Vote size={18} />
              <span>Cast Vote</span>
            </button>
            <button 
              type="button"
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Settings size={18} />
              <span>Admin Panel</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container" style={{ flexGrow: 1, padding: '32px 16px' }}>
        
        {/* Error / Offline Alert banner */}
        {errorMessage && (
          <div style={{
            display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px',
            backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)',
            border: '1px solid var(--danger-color)', marginBottom: '24px', alignItems: 'center'
          }}>
            <AlertTriangle size={24} />
            <div>
              <p style={{ fontWeight: 'bold' }}>Connection Error</p>
              <p style={{ fontSize: '0.9rem' }}>{errorMessage}</p>
            </div>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ marginLeft: 'auto', padding: '6px 12px' }} 
              onClick={fetchInitialData}
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Loading Spinner */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{
              width: '40px', height: '40px', border: '4px solid var(--border-color)',
              borderTopColor: 'var(--primary-color)', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px'
            }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-muted)' }}>Loading election assets...</p>
          </div>
        )}

        {/* Render Tab Screens once loaded */}
        {!isLoading && !errorMessage && (
          <>
            {activeTab === 'vote' && (
              <VotePage 
                categories={categories} 
                candidates={candidates} 
                apiBase={API_BASE} 
              />
            )}

            {activeTab === 'admin' && (
              <AdminPage 
                categories={categories} 
                candidates={candidates} 
                apiBase={API_BASE} 
                onRefresh={fetchInitialData} 
              />
            )}
          </>
        )}
      </main>

      {/* Page Footer (Linked contacts for Barimah and Nana Owusu Achiaw) */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 'auto',
        backgroundColor: 'var(--bg-card)', padding: '16px 0'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>KsTS Ballot System</span>
            <span style={{ fontSize: '0.85rem' }}>Secure, verified student body voting portal.</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '500' }}>Developers Support:</span>
            <a 
              href="mailto:barimah@example.com" 
              style={{ 
                color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold',
                display: 'inline-flex', alignItems: 'center', gap: '6px' 
              }}
            >
              <Mail size={14} />
              Barimah
            </a>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <a 
              href="mailto:nanaowusuachiaw@example.com" 
              style={{ 
                color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold',
                display: 'inline-flex', alignItems: 'center', gap: '6px' 
              }}
            >
              <Mail size={14} />
              Nana Owusu Achiaw
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
