import React, { useState } from 'react';
import { Tenant, SocialMediaEntry } from '../types';
import { generateId } from '../utils/dateUtils';
import { ConfirmationModal } from './ConfirmationModal';
import { Trash2 } from 'lucide-react';
import { 
  TenantForm, 
  TenantHeader, 
  TenantGrid, 
  TenantEmptyState 
} from './Tenants/index';

interface TenantsProps {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
}

export const Tenants: React.FC<TenantsProps> = ({
  tenants,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [tenantToDeleteId, setTenantToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as Tenant['status'],
    socialMedia: [] as SocialMediaEntry[],
    otherInformation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTenant) {
      onUpdateTenant({
        ...editingTenant,
        ...formData,
        otherInformation: formData.otherInformation || undefined,
      });
    } else {
      onAddTenant({
        id: generateId(),
        ...formData,
        otherInformation: formData.otherInformation || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      socialMedia: [],
      otherInformation: '',
    });
    setShowForm(false);
    setEditingTenant(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      status: tenant.status,
      socialMedia: tenant.socialMedia || [],
      otherInformation: tenant.otherInformation || '',
    });
    setShowForm(true);
  };

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleDeleteClick = (tenantId: string) => {
    setTenantToDeleteId(tenantId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteTenant = async () => {
    if (!tenantToDeleteId) return;

    setIsDeleting(true);
    try {
      await onDeleteTenant(tenantToDeleteId);
      setShowDeleteConfirmModal(false);
      setTenantToDeleteId(null);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteConfirmModal(false);
      setTenantToDeleteId(null);
    }
  };

  const tenantToDelete = tenantToDeleteId ? tenants.find(t => t.id === tenantToDeleteId) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <TenantHeader onAddTenant={() => setShowForm(true)} />

      <TenantForm
        isOpen={showForm}
        editingTenant={editingTenant}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmit}
        onClose={resetForm}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteTenant}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${tenantToDelete?.name}"? This action cannot be undone and will also remove all associated leases and payments.`}
        isProcessing={isDeleting}
        confirmButtonText="Delete Tenant"
        confirmButtonColor="red"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />

      {tenants.length === 0 ? (
        <TenantEmptyState onAddTenant={() => setShowForm(true)} />
      ) : (
        <TenantGrid
          tenants={tenants}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}
      
    </div>
  );
};