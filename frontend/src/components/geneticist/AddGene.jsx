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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.gene_id.match(/^[A-Z0-9_-]{4,20}$/)) {
      alert('Gene ID must be 4-20 characters, uppercase letters/numbers/underscore/hyphen.');
      return;
    }
    if (!formData.gene_name) {
      alert('Gene Name is required.');
      return;
    }
    if (!allowedMetabolizerStatus.includes(formData.metabolizer_status)) {
      alert('Metabolizer Status must be one of: poor, normal, rapid, ultra-rapid.');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/genes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (token) {
        document.cookie = `token=${token}; path=/`;
      }
      if (response.ok) {
        const data = await response.json();
        alert('Gene added successfully!');
        setFormData({
          gene_id: '',
          gene_name: '',
          genetic_variant_type: '',
          metabolizer_status: 'normal',
          isActive: true,
        });
      } else {
        const error = await response.json();
        alert('Error adding gene: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2>Add New Gene</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Gene ID</label>
          <input type="text" name="gene_id" value={formData.gene_id} onChange={handleChange} required placeholder="E.g. CYP2D6" />
        </div>
        <div>
          <label>Gene Name</label>
          <input type="text" name="gene_name" value={formData.gene_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Genetic Variant Type</label>
          <input type="text" name="genetic_variant_type" value={formData.genetic_variant_type} onChange={handleChange} />
        </div>
        <div>
          <label>Metabolizer Status</label>
          <select name="metabolizer_status" value={formData.metabolizer_status} onChange={handleChange}>
            <option value="poor">Poor</option>
            <option value="normal">Normal</option>
            <option value="rapid">Rapid</option>
            <option value="ultra-rapid">Ultra-rapid</option>
          </select>
        </div>
        <div>
          <label>Active</label>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: !formData.isActive })} />
        </div>
        <button type="submit">Add Gene</button>
      </form>
    </div>
  );
};

export default AddGene;
