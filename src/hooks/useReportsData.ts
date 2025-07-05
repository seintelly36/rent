import { useMemo } from 'react';
import { Asset, Tenant, Lease, Payment, AssetType, AssetReportData, TenantReportData, LeaseReportData, PaymentReportData } from '../types';
import { calculateDaysPastDue } from '../utils/csvUtils';

interface UseReportsDataProps {
  assets: Asset[];
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
  assetTypes: AssetType[];
}

export const useReportsData = ({
  assets,
  tenants,
  leases,
  payments,
  assetTypes,
}: UseReportsDataProps) => {
  const assetReportData = useMemo((): AssetReportData[] => {
    console.log('=== ASSET REPORT DEBUG ===');
    console.log('Assets array:', assets);
    console.log('Assets count:', assets.length);
    console.log('Sample asset IDs:', assets.slice(0, 3).map(a => ({ id: a.id, name: a.name })));
    
    return assets.map(asset => {
      const assetType = assetTypes.find(at => at.id === asset.assetTypeId);
      const activeLease = leases.find(l => l.assetId === asset.id && l.status === 'active');
      const tenant = activeLease ? tenants.find(t => t.id === activeLease.tenantId) : undefined;
      
      // Calculate financial metrics
      const assetPayments = payments.filter(p => p.assetId === asset.id && p.status === 'paid');
      const totalRevenue = assetPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalPayments = assetPayments.length;
      
      // Calculate occupancy rate (simplified - could be enhanced with time-based calculation)
      const occupancyRate = asset.status === 'occupied' ? 1 : 0;

      return {
        id: asset.id,
        name: asset.name,
        address: asset.address,
        assetType: assetType?.name || 'Unknown',
        status: asset.status,
        tenantName: tenant?.name,
        tenantEmail: tenant?.email,
        currentRent: activeLease?.rentAmount,
        totalRevenue,
        totalPayments,
        occupancyRate,
        createdAt: asset.createdAt,
      };
    });
  }, [assets, tenants, leases, payments, assetTypes]);

  const tenantReportData = useMemo((): TenantReportData[] => {
    return tenants.map(tenant => {
      const activeLease = leases.find(l => l.tenantId === tenant.id && l.status === 'active');
      const asset = activeLease ? assets.find(a => a.id === activeLease.assetId) : undefined;
      
      // Calculate payment metrics
      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
      const paidPayments = tenantPayments.filter(p => p.status === 'paid');
      const pendingPayments = tenantPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
      
      const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalDue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentHistory = tenantPayments.length;

      return {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        status: tenant.status,
        assetName: asset?.name,
        assetAddress: asset?.address,
        totalPaid,
        totalDue,
        paymentHistory,
        socialMediaCount: tenant.socialMedia?.length || 0,
        createdAt: tenant.createdAt,
      };
    });
  }, [tenants, leases, assets, payments]);

  const leaseReportData = useMemo((): LeaseReportData[] => {
    console.log('=== LEASE REPORT DEBUG ===');
    console.log('Leases array:', leases);
    console.log('Leases count:', leases.length);
    console.log('Assets array in lease report:', assets);
    console.log('Assets count in lease report:', assets.length);
    
    if (leases.length > 0) {
      const sampleLease = leases[0];
      console.log('Sample lease:', sampleLease);
      console.log('Sample lease assetId:', sampleLease.assetId);
      
      const foundAsset = assets.find(a => a.id === sampleLease.assetId);
      console.log('Found asset for sample lease:', foundAsset);
      
      console.log('All asset IDs:', assets.map(a => a.id));
      console.log('All lease asset IDs:', leases.map(l => l.assetId));
    }
    
    return leases.map(lease => {
      const tenant = tenants.find(t => t.id === lease.tenantId);
      const asset = assets.find(a => a.id === lease.assetId);
      
      console.log(`Lease ${lease.id}:`);
      console.log(`  - Looking for asset ID: ${lease.assetId}`);
      console.log(`  - Found asset:`, asset);
      console.log(`  - Asset name: ${asset?.name || 'NOT FOUND'}`);
      
      // Calculate lease financial metrics
      const leasePayments = payments.filter(p => 
        p.tenantId === lease.tenantId && 
        p.assetId === lease.assetId && 
        p.status === 'paid'
      );
      
      const totalRevenue = leasePayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentCount = leasePayments.length;

      return {
        id: lease.id,
        tenantName: tenant?.name || 'Unknown',
        assetName: asset?.name || 'Unknown',
        startDate: lease.startDate,
        endDate: lease.endDate,
        rentAmount: lease.rentAmount,
        deposit: lease.deposit,
        depositCollected: lease.depositCollectedAmount || 0,
        status: lease.status,
        leaseType: lease.leaseType,
        totalRevenue,
        paymentCount,
        createdAt: lease.createdAt,
      };
    });
  }, [leases, tenants, assets, payments]);

  const paymentReportData = useMemo((): PaymentReportData[] => {
    console.log('=== PAYMENT REPORT DEBUG ===');
    console.log('Payments array:', payments);
    console.log('Payments count:', payments.length);
    console.log('Assets array in payment report:', assets);
    console.log('Assets count in payment report:', assets.length);
    
    if (payments.length > 0) {
      const samplePayment = payments[0];
      console.log('Sample payment:', samplePayment);
      console.log('Sample payment assetId:', samplePayment.assetId);
      
      const foundAsset = assets.find(a => a.id === samplePayment.assetId);
      console.log('Found asset for sample payment:', foundAsset);
    }
    
    return payments.map(payment => {
      const tenant = tenants.find(t => t.id === payment.tenantId);
      const asset = assets.find(a => a.id === payment.assetId);
      
      console.log(`Payment ${payment.id}:`);
      console.log(`  - Looking for asset ID: ${payment.assetId}`);
      console.log(`  - Found asset:`, asset);
      console.log(`  - Asset name: ${asset?.name || 'NOT FOUND'}`);
      
      // Calculate days past due for overdue payments
      const daysPastDue = payment.status === 'overdue' ? calculateDaysPastDue(payment.dueDate) : undefined;

      return {
        id: payment.id,
        tenantName: tenant?.name || 'Unknown',
        assetName: asset?.name || 'Unknown',
        amount: payment.amount,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        status: payment.status,
        method: payment.method,
        referenceCode: payment.referenceCode,
        daysPastDue,
        createdAt: payment.createdAt,
      };
    });
  }, [payments, tenants, assets]);

  const summaryData = useMemo(() => {
    const totalAssets = assets.length;
    const totalTenants = tenants.filter(t => t.status === 'active').length;
    const totalLeases = leases.length;
    const totalPayments = payments.length;
    
    const paidPayments = payments.filter(p => p.status === 'paid');
    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
    
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const occupiedAssets = assets.filter(a => a.status === 'occupied').length;
    const occupancyRate = totalAssets > 0 ? occupiedAssets / totalAssets : 0;
    
    const activeLeases = leases.filter(l => l.status === 'active');
    const averageRent = activeLeases.length > 0 
      ? activeLeases.reduce((sum, l) => sum + l.rentAmount, 0) / activeLeases.length 
      : 0;

    return {
      totalAssets,
      totalTenants,
      totalLeases,
      totalPayments,
      totalRevenue,
      pendingAmount,
      occupancyRate,
      averageRent,
    };
  }, [assets, tenants, leases, payments]);

  return {
    assetReportData,
    tenantReportData,
    leaseReportData,
    paymentReportData,
    summaryData,
  };
};