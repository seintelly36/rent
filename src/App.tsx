import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { ResponsiveNav } from './components/ResponsiveNav';
import { Dashboard } from './components/Dashboard';
import { Assets } from './components/Assets';
import { AssetTypes } from './components/AssetTypes';
import { Tenants } from './components/Tenants';
import { Leases } from './components/Leases';
import { Payments } from './components/Payments';
import { Collections } from './components/Collections';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useNotification } from './hooks/useNotification';
import { Notification } from './components/Notification';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  Settings as SettingsIcon,
  Tag,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAssetTypes } from './hooks/useAssetTypes';
import { useAssets } from './hooks/useAssets';
import { useTenants } from './hooks/useTenants';
import { useLeases } from './hooks/useLeases';
import { usePayments } from './hooks/usePayments';
import { isOverdue } from './utils/dateUtils';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, hideNotification } = useNotification();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const {
    assetTypes,
    loading: assetTypesLoading,
    addAssetType,
    updateAssetType,
    deleteAssetType,
  } = useAssetTypes(user?.id);

  const {
    assets,
    loading: assetsLoading,
    addAsset,
    updateAsset,
    deleteAsset,
  } = useAssets(user?.id);

  const {
    tenants,
    loading: tenantsLoading,
    addTenant,
    updateTenant,
    deleteTenant,
  } = useTenants(user?.id);

  const {
    leases,
    loading: leasesLoading,
    addLease,
    updateLease,
    deleteLease,
    refetch: refetchLeases,
  } = useLeases(user?.id);

  const {
    payments,
    loading: paymentsLoading,
    addPayment,
    updatePayment,
    deletePayment,
    collectPaymentWithDeposit,
  } = usePayments(user?.id);

  // Update payment status based on due dates
  useEffect(() => {
    if (!user?.id || paymentsLoading) return;

    const updatePaymentStatuses = async () => {
      const overduePayments = payments.filter(payment => 
        payment.status === 'pending' && isOverdue(payment.dueDate)
      );

      for (const payment of overduePayments) {
        try {
          await updatePayment({ ...payment, status: 'overdue' });
        } catch (error) {
          console.error('Failed to update payment status:', error);
        }
      }
    };

    updatePaymentStatuses();
    const interval = setInterval(updatePaymentStatuses, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [payments, updatePayment, user?.id, paymentsLoading]);

  // Update asset occupancy status based on active leases
  useEffect(() => {
    if (!user?.id || assetsLoading || leasesLoading) return;

    const updateAssetStatuses = async () => {
      const assetsToUpdate = assets.filter(asset => {
        const activeLease = leases.find(
          l => l.assetId === asset.id && l.status === 'active'
        );
        
        return (activeLease && asset.status === 'vacant') || 
               (!activeLease && asset.status === 'occupied');
      });

      for (const asset of assetsToUpdate) {
        const activeLease = leases.find(
          l => l.assetId === asset.id && l.status === 'active'
        );
        
        try {
          if (activeLease && asset.status === 'vacant') {
            await updateAsset({ ...asset, status: 'occupied', tenantId: activeLease.tenantId });
          } else if (!activeLease && asset.status === 'occupied') {
            await updateAsset({ ...asset, status: 'vacant', tenantId: undefined });
          }
        } catch (error) {
          console.error('Failed to update asset status:', error);
        }
      }
    };

    updateAssetStatuses();
  }, [leases, assets, updateAsset, user?.id, assetsLoading, leasesLoading]);

  const handleDeleteTenant = async (id: string) => {
    try {
      // Remove associated payments and leases
      const tenantPayments = payments.filter(p => p.tenantId === id);
      for (const payment of tenantPayments) {
        await deletePayment(payment.id);
      }

      const tenantLeases = leases.filter(l => l.tenantId === id);
      for (const lease of tenantLeases) {
        await deleteLease(lease.id);
      }

      await deleteTenant(id);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const handleDeleteAssetType = async (id: string) => {
    try {
      // Remove associated assets, leases, and payments
      const assetsToDelete = assets.filter(a => a.assetTypeId === id);
      for (const asset of assetsToDelete) {
        const assetLeases = leases.filter(l => l.assetId === asset.id);
        for (const lease of assetLeases) {
          await deleteLease(lease.id);
        }

        const assetPayments = payments.filter(p => p.assetId === asset.id);
        for (const payment of assetPayments) {
          await deletePayment(payment.id);
        }

        await deleteAsset(asset.id);
      }
      await deleteAssetType(id);
    } catch (error) {
      console.error('Failed to delete asset type:', error);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      // Remove associated leases and payments
      const assetLeases = leases.filter(l => l.assetId === id);
      for (const lease of assetLeases) {
        await deleteLease(lease.id);
      }

      const assetPayments = payments.filter(p => p.assetId === id);
      for (const payment of assetPayments) {
        await deletePayment(payment.id);
      }

      await deleteAsset(id);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleToggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleCloseNav = () => {
    setIsNavOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const loading = assetTypesLoading || assetsLoading || tenantsLoading || leasesLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'assets', name: 'Assets', icon: Building2, path: '/assets' },
    { id: 'assetTypes', name: 'Asset Types', icon: Tag, path: '/asset-types' },
    { id: 'tenants', name: 'Tenants', icon: Users, path: '/tenants' },
    { id: 'leases', name: 'Leases', icon: FileText, path: '/leases' },
    { id: 'payments', name: 'Payments', icon: CreditCard, path: '/payments' },
    { id: 'collections', name: 'Collections', icon: DollarSign, path: '/collections' },
    { id: 'reports', name: 'Reports', icon: BarChart3, path: '/reports' },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification System */}
      <Notification 
        notifications={notifications} 
        onHide={hideNotification} 
      />
      
      {/* Top Bar */}
      <TopBar onToggleNav={handleToggleNav} />
      
      {/* Responsive Navigation */}
      <ResponsiveNav 
        navigation={navigation} 
        isOpen={isNavOpen}
        onClose={handleCloseNav}
      />
      
      {/* Main Content */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                assets={assets}
                tenants={tenants}
                payments={payments}
              />
            } 
          />
          <Route 
            path="/asset-types" 
            element={
              <AssetTypes
                assetTypes={assetTypes}
                onAddAssetType={addAssetType}
                onUpdateAssetType={updateAssetType}
                onDeleteAssetType={handleDeleteAssetType}
              />
            } 
          />
          <Route 
            path="/assets" 
            element={
              <Assets
                assets={assets}
                tenants={tenants}
                assetTypes={assetTypes}
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={handleDeleteAsset}
              />
            } 
          />
          <Route 
            path="/tenants" 
            element={
              <Tenants
                tenants={tenants}
                onAddTenant={addTenant}
                onUpdateTenant={updateTenant}
                onDeleteTenant={handleDeleteTenant}
              />
            } 
          />
          <Route 
            path="/leases" 
            element={
              <Leases />
            } 
          />
          <Route 
            path="/payments" 
            element={
              <Payments
                payments={payments}
                tenants={tenants}
                assets={assets}
                onAddPayment={addPayment}
                onUpdatePayment={updatePayment}
                onDeletePayment={deletePayment}
              />
            } 
          />
          <Route 
            path="/collections" 
            element={
              <Collections
                leases={leases}
                payments={payments}
                assets={assets}
                tenants={tenants}
                onCollectPayment={collectPaymentWithDeposit}
                onRefreshLeases={refetchLeases}
              />
            } 
          />
          <Route 
            path="/reports" 
            element={
              <Reports
                assets={assets}
                tenants={tenants}
                leases={leases}
                payments={payments}
                assetTypes={assetTypes}
              />
            } 
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;