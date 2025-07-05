import React from 'react';
import { 
  Building2, 
  Users, 
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Asset, Tenant, Payment, DashboardStats } from '../types';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

interface DashboardProps {
  assets: Asset[];
  tenants: Tenant[];
  payments: Payment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ assets, tenants, payments }) => {
  const stats: DashboardStats = {
    totalAssets: assets.length,
    occupiedAssets: assets.filter(a => a.status === 'occupied').length,
    totalTenants: tenants.filter(t => t.status === 'active').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
  };

  const recentPayments = payments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingPayments = payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your assets.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {stats.occupiedAssets} occupied
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              All leases active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-amber-600">
              {stats.overduePayments} overdue
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAssets > 0 ? Math.round((stats.occupiedAssets / stats.totalAssets) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-emerald-600">
              {stats.occupiedAssets} of {stats.totalAssets} units
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenantId);
                const asset = assets.find(a => a.id === payment.assetId);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                      <p className="text-xs text-gray-500">{asset?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.paidDate || payment.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Payments</h2>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenantId);
                const asset = assets.find(a => a.id === payment.assetId);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                      <p className="text-xs text-gray-500">{asset?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">Due {formatDateTime(payment.dueDate)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming payments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};