import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Category } from '../../../types';

interface PositionsTabProps {
  categories: Category[];
  onAddClick: () => void;
  onEditClick: (cat: Category) => void;
  onDeleteClick: (id: number) => void;
}

export const PositionsTab: React.FC<PositionsTabProps> = ({
  categories,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div>
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Voting Positions</h2>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onAddClick}
        >
          <Plus size={18} />
          Add Position
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Position ID</th>
              <th>Position Name</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No voting positions found. Click "Add Position" to create one.
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-main)' }}>{cat.name}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="action-icon-btn" 
                        onClick={() => onEditClick(cat)}
                        title="Edit Position Name"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-icon-btn delete" 
                        onClick={() => onDeleteClick(cat.id)}
                        title="Delete Position"
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
