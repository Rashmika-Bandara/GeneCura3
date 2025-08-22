import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const GeneManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const [genes, setGenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editGeneId, setEditGeneId] = useState(null);
  const [editForm, setEditForm] = useState({
    gene_id: '',
    gene_name: '',
    genetic_variant_type: '',
    metabolizer_status: '',
  });
  // Start editing a gene
  const handleEditGene = (gene) => {
    setEditGeneId(gene.gene_id);
    setEditForm({
      gene_id: gene.gene_id,
      gene_name: gene.gene_name,
      genetic_variant_type: gene.genetic_variant_type,
      metabolizer_status: gene.metabolizer_status,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditGeneId(null);
    setEditForm({
      gene_id: '',
      gene_name: '',
      genetic_variant_type: '',
      metabolizer_status: '',
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edit
  const handleUpdateGene = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/v1/genes/${editGeneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGenes((prev) => prev.map((g) => g.gene_id === editGeneId ? { ...g, ...editForm } : g));
        alert('Gene updated successfully');
        handleCancelEdit();
      } else {
        alert(data.message || 'Failed to update gene');
      }
    } catch (err) {
      alert('Error updating gene: ' + err.message);
    }
  };

  useEffect(() => {
    const fetchGenes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/v1/genes', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch genes');
        }
  const data = await response.json();
  setGenes(data.data?.genes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGenes();
  }, []);

  const filteredGenes = genes.filter(gene =>
    gene.gene_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gene.gene_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGene = () => {
    // Navigate to the AddGene page when the Add Gene button is clicked
    navigate('/add-gene');  // This will redirect to the AddGene page
  };

  // Delete gene handler
  const handleDeleteGene = async (geneId) => {
    if (!window.confirm('Are you sure you want to delete this gene?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/genes/${geneId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGenes((prev) => prev.filter((g) => g.gene_id !== geneId));
        alert('Gene deleted successfully');
      } else {
        alert(data.message || 'Failed to delete gene');
      }
    } catch (err) {
      alert('Error deleting gene: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gene Management</h2>
          <p className="text-sm text-gray-600">Manage genetic information and variants</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={handleAddGene}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gene
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search genes..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Genes Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Genes Database</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading genes...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gene ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gene Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metabolizer Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGenes.map((gene) => (
                  editGeneId === gene.gene_id ? (
                    <tr key={gene.gene_id} className="bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gene.gene_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input type="text" name="gene_name" value={editForm.gene_name} onChange={handleEditFormChange} className="form-input" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input type="text" name="genetic_variant_type" value={editForm.genetic_variant_type} onChange={handleEditFormChange} className="form-input" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select name="metabolizer_status" value={editForm.metabolizer_status} onChange={handleEditFormChange} className="form-select">
                          <option value="normal">Normal</option>
                          <option value="rapid">Rapid</option>
                          <option value="poor">Poor</option>
                          <option value="ultra-rapid">Ultra-rapid</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gene.created_date || gene.createdAt || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-900" onClick={handleUpdateGene}>Save</button>
                          <button className="text-gray-600 hover:text-gray-900" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={gene.gene_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gene.gene_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gene.gene_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gene.genetic_variant_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gene.metabolizer_status === 'normal' ? 'bg-green-100 text-green-800' :
                          gene.metabolizer_status === 'rapid' ? 'bg-blue-100 text-blue-800' :
                          gene.metabolizer_status === 'poor' ? 'bg-yellow-100 text-yellow-800' :
                          gene.metabolizer_status === 'ultra-rapid' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {gene.metabolizer_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gene.created_date || gene.createdAt || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">

                          <button className="text-primary-600 hover:text-primary-900" onClick={() => handleEditGene(gene)}>Edit</button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteGene(gene.gene_id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneManagement;
