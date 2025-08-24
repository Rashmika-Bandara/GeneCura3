import { useState } from 'react';

const AddGene = () => {
  const [formData, setFormData] = useState({
    gene_id: '',
    gene_name: '',
    genetic_variant_type: '',
    metabolizer_status: 'normal', // Default to 'normal'
    isActive: true,
  });
  const allowedMetabolizerStatus = ['poor', 'normal', 'rapid', 'ultra-rapid'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'gene_id' ? value.toUpperCase() : value,
    });
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Frontend validation
    if (!formData.gene_id.match(/^[A-Z0-9_-]{4,20}$/)) {
      setError('Gene ID must be 4-20 characters, uppercase letters/numbers/underscore/hyphen.');
      return;
    }
    if (!formData.gene_name) {
      setError('Gene Name is required.');
      return;
    }
    if (!allowedMetabolizerStatus.includes(formData.metabolizer_status)) {
      setError('Metabolizer Status must be one of: poor, normal, rapid, ultra-rapid.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/v1/genes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Gene added successfully!');
        setFormData({
          gene_id: '',
          gene_name: '',
          genetic_variant_type: '',
          metabolizer_status: 'normal',
          isActive: true,
        });
      } else {
        setError(data.message || 'Error adding gene');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold text-primary-700 mb-4">Add New Gene</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div>
        <label htmlFor="gene_id" className="block text-sm font-medium text-gray-700 mb-1">
          Gene ID <span className="text-red-500">*</span>
        </label>
        <input
          id="gene_id"
          name="gene_id"
          type="text"
          className="form-input"
          placeholder="E.g. CYP2D6"
          value={formData.gene_id}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="gene_name" className="block text-sm font-medium text-gray-700 mb-1">
          Gene Name <span className="text-red-500">*</span>
        </label>
        <input
          id="gene_name"
          name="gene_name"
          type="text"
          className="form-input"
          placeholder="E.g. Cytochrome P450 2D6"
          value={formData.gene_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="genetic_variant_type" className="block text-sm font-medium text-gray-700 mb-1">
          Variant Type
        </label>
        <input
          id="genetic_variant_type"
          name="genetic_variant_type"
          type="text"
          className="form-input"
          placeholder="E.g. SNP"
          value={formData.genetic_variant_type}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="metabolizer_status" className="block text-sm font-medium text-gray-700 mb-1">
          Metabolizer Status <span className="text-red-500">*</span>
        </label>
        <select
          id="metabolizer_status"
          name="metabolizer_status"
          className="form-select"
          value={formData.metabolizer_status}
          onChange={handleChange}
          required
        >
          <option value="">Select status</option>
          <option value="poor">Poor</option>
          <option value="normal">Normal</option>
          <option value="rapid">Rapid</option>
          <option value="ultra-rapid">Ultra-rapid</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="submit" className="btn-primary">Add Gene</button>
        <button
          type="reset"
          className="btn-secondary"
          onClick={() => setFormData({
            gene_id: '',
            gene_name: '',
            genetic_variant_type: '',
            metabolizer_status: 'normal',
            isActive: true,
          })}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default AddGene;
