import { useState } from 'react';

const AddGene = () => {
  const [formData, setFormData] = useState({
    gene_id: '',
    gene_name: '',
    genetic_variant_type: '',
    metabolizer_status: 'normal', // Default to 'normal'
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the token along with the POST request
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/genes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      // Set cookie manually (for browsers that allow it)
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
          <input type="text" name="gene_id" value={formData.gene_id} onChange={handleChange} required />
        </div>
        <div>
          <label>Gene Name</label>
          <input type="text" name="gene_name" value={formData.gene_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Genetic Variant Type</label>
          <input type="text" name="genetic_variant_type" value={formData.genetic_variant_type} onChange={handleChange} required />
        </div>
        <div>
          <label>Metabolizer Status</label>
          <select name="metabolizer_status" value={formData.metabolizer_status} onChange={handleChange}>
            <option value="normal">Normal</option>
            <option value="rapid">Rapid</option>
            <option value="slow">Slow</option>
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
