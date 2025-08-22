import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicineSchema } from '../../utils/validation';
import { useMutation, useQueryClient } from 'react-query';
import { medicinesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

const AddMedicine = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(medicineSchema),
  });

  const createMutation = useMutation(medicinesAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('medicines');
      toast.success('Medicine added successfully');
      navigate('/dashboard/pharmacologist/medicines');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to add medicine';
      toast.error(message);
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Medicine</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Medicine ID *</label>
          <input {...register('medicine_id')} className="form-input" placeholder="e.g., MED001" />
          {errors.medicine_id && <p className="text-red-600 text-sm mt-1">{errors.medicine_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input {...register('name')} className="form-input" placeholder="Medicine name" />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register('description')} className="form-textarea" rows={3} placeholder="Description" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Manufacturer</label>
          <input {...register('manufacturer')} className="form-input" placeholder="Manufacturer" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSubmitting || createMutation.isLoading}>
            {isSubmitting || createMutation.isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;
