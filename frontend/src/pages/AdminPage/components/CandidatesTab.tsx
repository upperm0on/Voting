import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Candidate } from '../../../types';

interface CandidatesTabProps {
  candidates: Candidate[];
  onAddClick: () => void;
  onEditClick: (cand: Candidate) => void;
  onDeleteClick: (id: number) => void;
  apiBase: string;
}

export const CandidatesTab: React.FC<CandidatesTabProps> = ({
  candidates,
  onAddClick,
  onEditClick,
  onDeleteClick,
  apiBase
}) => {
  // Helper: Get candidate image path safely
  const getPictureUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  return (
    <div>
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Candidate Directory</h2>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onAddClick}
        >
          <Plus size={18} />
          Register Candidate
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Candidate Name</th>
              <th>Contesting Position</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No candidates registered. Click "Register Candidate" to add one.
                </td>
              </tr>
            ) : (
              candidates.map(cand => (
                <tr key={cand.id}>
                  <td>
                    <img 
                      src={getPictureUrl(cand.picture)} 
                      alt="" 
                      className="thumbnail-pic" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  </td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-main)' }}>{cand.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{cand.position_name}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="action-icon-btn" 
                        onClick={() => onEditClick(cand)}
                        title="Edit Candidate Details"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-icon-btn delete" 
                        onClick={() => onDeleteClick(cand.id)}
                        title="Delete Candidate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
