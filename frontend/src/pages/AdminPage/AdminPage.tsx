import React, { useState, useRef } from 'react';
import { Camera, Lock, LogOut } from 'lucide-react';
import type { Category, Candidate } from '../../types';
import { AdminSidebar } from './components/AdminSidebar';
import { PositionsTab } from './components/PositionsTab';
import { CandidatesTab } from './components/CandidatesTab';
import { TokensTab } from './components/TokensTab';
import { Modal } from '../../components/ui/Modal';
import { ResultsPage } from '../ResultsPage/ResultsPage';

interface AdminPageProps {
  categories: Category[];
  candidates: Candidate[];
  apiBase: string;
  onRefresh: () => Promise<void>;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  categories,
  candidates,
  apiBase,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'candidates' | 'tokens' | 'results'>('categories');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError(null);
    } else {
      setLoginError('Invalid administrator credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
  };

  // Modals visibility states
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [isCandModalOpen, setIsCandModalOpen] = useState<boolean>(false);

  // Forms state variables
  const [categoryFormName, setCategoryFormName] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [candidateFormName, setCandidateFormName] = useState<string>('');
  const [candidateFormPos, setCandidateFormPos] = useState<string>('');
  const [candidateFormFile, setCandidateFormFile] = useState<File | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Actions
  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCategoryFormName('');
    setIsCatModalOpen(true);
  };

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormName(cat.name);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormName.trim()) return;

    try {
      const url = editingCategory 
        ? `${apiBase}/api/categories/${editingCategory.id}/` 
        : `${apiBase}/api/categories/`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryFormName.trim() })
      });

      if (!res.ok) throw new Error('Failed to save category.');

      await onRefresh();
      setIsCatModalOpen(false);
      setCategoryFormName('');
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message || 'Error saving category.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this position? Doing so will delete all associated candidates and votes.')) return;
    
    try {
      const res = await fetch(`${apiBase}/api/categories/${id}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete category.');
      
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting category.');
    }
  };

  // Candidate Actions
  const handleAddCandidateClick = () => {
    setEditingCandidate(null);
    setCandidateFormName('');
    setCandidateFormPos('');
    setCandidateFormFile(null);
    setIsCandModalOpen(true);
  };

  const handleEditCandidateClick = (cand: Candidate) => {
    setEditingCandidate(cand);
    setCandidateFormName(cand.name);
    setCandidateFormPos(cand.position.toString());
    setCandidateFormFile(null);
    setIsCandModalOpen(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateFormName.trim() || !candidateFormPos) return;

    try {
      const url = editingCandidate 
        ? `${apiBase}/api/individuals/${editingCandidate.id}/` 
        : `${apiBase}/api/individuals/`;
      const method = editingCandidate ? 'PATCH' : 'POST';

      const formData = new FormData();
      formData.append('name', candidateFormName.trim());
      formData.append('position', candidateFormPos);
      if (candidateFormFile) {
        formData.append('picture', candidateFormFile);
      }

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (!res.ok) throw new Error('Failed to save candidate.');

      await onRefresh();
      setIsCandModalOpen(false);
      setCandidateFormName('');
      setCandidateFormPos('');
      setCandidateFormFile(null);
      setEditingCandidate(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err.message || 'Error saving candidate.');
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate? Associated votes will be deleted.')) return;
    
    try {
      const res = await fetch(`${apiBase}/api/individuals/${id}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete candidate.');
      
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting candidate.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
        <div className="wizard-card" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Admin Authorization</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Access is restricted to authorized personnel.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loginError && (
              <div style={{
                padding: '12px', borderRadius: '8px', backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-color)', border: '1px solid var(--danger-color)', fontSize: '0.85rem'
              }}>
                {loginError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="adminUsername">Username</label>
              <input 
                type="text" 
                id="adminUsername"
                className="form-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="adminPassword">Password</label>
              <input 
                type="password" 
                id="adminPassword"
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Authorize Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Election Management Center</h1>
        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="admin-layout">
        {/* Sidebar Tabs */}
        <AdminSidebar activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Content Panel */}
        <div className="admin-content">
          {activeTab === 'categories' && (
            <PositionsTab 
              categories={categories}
              onAddClick={handleAddCategoryClick}
              onEditClick={handleEditCategoryClick}
              onDeleteClick={handleDeleteCategory}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesTab 
              candidates={candidates}
              onAddClick={handleAddCandidateClick}
              onEditClick={handleEditCandidateClick}
              onDeleteClick={handleDeleteCandidate}
              apiBase={apiBase}
            />
          )}

          {activeTab === 'tokens' && (
            <TokensTab apiBase={apiBase} />
          )}

          {activeTab === 'results' && (
            <ResultsPage apiBase={apiBase} />
          )}
        </div>
      </div>

      {/* Category CRUD Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCategory ? 'Edit Position' : 'Add Position'}
      >
        <form onSubmit={handleSaveCategory}>
          <div className="form-group">
            <label className="form-label" htmlFor="positionNameInput">Position Name</label>
            <input 
              type="text" 
              id="positionNameInput"
              className="form-input" 
              value={categoryFormName}
              onChange={(e) => setCategoryFormName(e.target.value)}
              placeholder="e.g. SRC President"
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsCatModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Position</button>
          </div>
        </form>
      </Modal>

      {/* Candidate CRUD Modal */}
      <Modal
        isOpen={isCandModalOpen}
        onClose={() => setIsCandModalOpen(false)}
        title={editingCandidate ? 'Edit Candidate Details' : 'Register Candidate'}
      >
        <form onSubmit={handleSaveCandidate}>
          <div className="form-group">
            <label className="form-label" htmlFor="candidateNameInput">Candidate Full Name</label>
            <input 
              type="text" 
              id="candidateNameInput"
              className="form-input" 
              value={candidateFormName}
              onChange={(e) => setCandidateFormName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="candidatePosInput">Office Position</label>
            <select 
              id="candidatePosInput"
              className="form-input" 
              value={candidateFormPos}
              onChange={(e) => setCandidateFormPos(e.target.value)}
              required
            >
              <option value="">-- Select Position --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Camera size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              Candidate Profile Photo
            </label>
            <input 
              type="file" 
              ref={fileInputRef}
              className="form-input" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCandidateFormFile(e.target.files[0]);
                }
              }}
              required={!editingCandidate}
            />
            {editingCandidate && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Leave empty to retain the current image.
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsCandModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Candidate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
