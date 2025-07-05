import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  X as XIcon
} from 'lucide-react';
import { Payment, Tenant, Asset } from '../types';
import { formatCurrency, formatDateTime, isOverdue, generateId } from '../utils/dateUtils';
import { ConfirmationModal } from './ConfirmationModal';

interface PaymentsProps {
  payments: Payment[];
  tenants: Tenant[];
  assets: Asset[];
  onAddPayment: (payment: Payment) => void;
  onUpdatePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
}

export const Payments: React.FC<PaymentsProps> = ({
  payments,
  tenants,
  assets,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>('all');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [paymentToDeleteId, setPaymentToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    assetId: '',
    amount: 0,
    dueDate: '',
    paidDate: '',
    status: 'pending' as Payment['status'],
    method: 'bank_transfer' as Payment['method'],
    notes: '',
    referenceCode: '',
  });

  const filteredPayments = payments.filter((payment) => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const asset = assets.find(a => a.id === payment.assetId);
    
    const matchesSearch = !searchTerm || 
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tenantId || !formData.assetId) return;
    
    const paymentData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      paidDate: formData.status === 'paid' && formData.paidDate 
        ? new Date(formData.paidDate).toISOString() 
        : formData.status === 'paid' 
        ? new Date().toISOString() 
        : undefined,
      referenceCode: formData.referenceCode || undefined,
    };
    
    if (editingPayment) {
      onUpdatePayment({
        ...editingPayment,
        ...paymentData,
      });
    } else {
      onAddPayment({
        id: generateId(),
        ...paymentData,
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      assetId: '',
      amount: 0,
      dueDate: '',
      paidDate: '',
      status: 'pending',
      method: 'bank_transfer',
      notes: '',
      referenceCode: '',
    });
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      tenantId: payment.tenantId,
      assetId: payment.assetId,
      amount: payment.amount,
      dueDate: payment.dueDate.slice(0, 16),
      paidDate: payment.paidDate ? payment.paidDate.slice(0, 16) : '',
      status: payment.status,
      method: payment.method || 'bank_transfer',
      notes: payment.notes || '',
      referenceCode: payment.referenceCode || '',
    });
    setShowForm(true);
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    setFormData({ 
      ...formData, 
      tenantId,
      assetId: '',
      amount: 0
    });
  };

  const markAsPaid = (payment: Payment) => {
    onUpdatePayment({
      ...payment,
      status: 'paid',
      paidDate: new Date().toISOString(),
    });
  };

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDeleteId(paymentId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDeleteId) return;

    setIsDeleting(true);
    try {
      await onDeletePayment(paymentToDeleteId);
      setShowDeleteConfirmModal(false);
      setPaymentToDeleteId(null);
    } catch (error) {
      console.error('Failed to delete payment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteConfirmModal(false);
      setPaymentToDeleteId(null);
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'refunded':
        return <RotateCcw className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XIcon className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = filteredPayments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
  const refundedAmount = filteredPayments.filter(p => p.status === 'refunded').reduce((sum, payment) => Math.abs(payment.amount), 0);

  const paymentToDelete = paymentToDeleteId ? payments.find(p => p.id === paymentToDeleteId) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-gray-600 mt-1">Track all financial transactions including payments, refunds, and adjustments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Refunded</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(refundedAmount)}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by tenant, asset, or reference code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPayment ? 'Edit Payment' : 'Add New Payment'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant
                </label>
                <select
                  required
                  value={formData.tenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a tenant</option>
                  {tenants.filter(t => t.status === 'active').map((tenant) => {
                    const asset = assets.find(a => a.id === tenant.assetId);
                    return (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {asset?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset
                </label>
                <select
                  required
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.address}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as Payment['method'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="online">Online Payment</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Code
                </label>
                <input
                  type="text"
                  value={formData.referenceCode}
                  onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Transaction reference, check number, etc."
                />
              </div>
              
              {formData.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.paidDate}
                    onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPayment ? 'Update Payment' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeletePayment}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment of ${paymentToDelete ? formatCurrency(paymentToDelete.amount) : ''}? This action cannot be undone.`}
        isProcessing={isDeleting}
        confirmButtonText="Delete Payment"
        confirmButtonColor="red"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenantId);
                const asset = assets.find(a => a.id === payment.assetId);
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-blue-600">
                            {tenant?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                          <p className="text-xs text-gray-500">{tenant?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{asset?.name}</p>
                      <p className="text-xs text-gray-500">{asset?.address}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm font-medium ${
                        payment.amount < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.method && (
                        <p className="text-xs text-gray-500 capitalize">
                          {payment.method.replace('_', ' ')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatDateTime(payment.dueDate)}</p>
                      {payment.paidDate && (
                        <p className="text-xs text-gray-500">Paid: {formatDateTime(payment.paidDate)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.referenceCode ? (
                        <p className="text-sm text-gray-900 font-mono">{payment.referenceCode}</p>
                      ) : (
                        <span className="text-xs text-gray-400">No reference</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => markAsPaid(payment)}
                            onClick={() => handleDeleteClick(payment.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeletePayment(payment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">Start tracking financial transactions from your tenants</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};