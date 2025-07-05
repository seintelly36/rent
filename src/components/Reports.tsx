import React from 'react';
import { BarChart3, FileDown } from 'lucide-react';
import { Asset, Tenant, Lease, Payment, AssetType, ReportColumn } from '../types';
import { ReportExportButtons, ReportSummaryCards } from './Reports/index';
import { useReportsData } from '../hooks/useReportsData';
import { exportToCsv, formatCurrency, formatDate, formatDateTime, formatPercentage } from '../utils/csvUtils';

interface ReportsProps {
  assets: Asset[];
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
  assetTypes: AssetType[];
}

export const Reports: React.FC<ReportsProps> = ({
  assets,
  tenants,
  leases,
  payments,
  assetTypes,
}) => {
  const {
    assetReportData,
    tenantReportData,
    leaseReportData,
    paymentReportData,
    summaryData,
  } = useReportsData({ assets, tenants, leases, payments, assetTypes });

  const handleExportAssets = () => {
    const columns: ReportColumn[] = [
      { header: 'Asset ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Address', key: 'address' },
      { header: 'Type', key: 'assetType' },
      { header: 'Status', key: 'status' },
      { header: 'Tenant Name', key: 'tenantName' },
      { header: 'Tenant Email', key: 'tenantEmail' },
      { header: 'Current Rent', key: 'currentRent', formatter: (value) => value ? formatCurrency(value) : '' },
      { header: 'Total Revenue', key: 'totalRevenue', formatter: formatCurrency },
      { header: 'Total Payments', key: 'totalPayments' },
      { header: 'Occupancy Rate', key: 'occupancyRate', formatter: formatPercentage },
      { header: 'Created Date', key: 'createdAt', formatter: formatDate },
    ];

    exportToCsv(assetReportData, columns, `assets-report-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportTenants = () => {
    const columns: ReportColumn[] = [
      { header: 'Tenant ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Status', key: 'status' },
      { header: 'Asset Name', key: 'assetName' },
      { header: 'Asset Address', key: 'assetAddress' },
      { header: 'Total Paid', key: 'totalPaid', formatter: formatCurrency },
      { header: 'Total Due', key: 'totalDue', formatter: formatCurrency },
      { header: 'Payment History Count', key: 'paymentHistory' },
      { header: 'Social Media Profiles', key: 'socialMediaCount' },
      { header: 'Created Date', key: 'createdAt', formatter: formatDate },
    ];

    exportToCsv(tenantReportData, columns, `tenants-report-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportLeases = () => {
    const columns: ReportColumn[] = [
      { header: 'Lease ID', key: 'id' },
      { header: 'Tenant Name', key: 'tenantName' },
      { header: 'Asset Name', key: 'assetName' },
      { header: 'Start Date', key: 'startDate', formatter: formatDateTime },
      { header: 'End Date', key: 'endDate', formatter: formatDateTime },
      { header: 'Rent Amount', key: 'rentAmount', formatter: formatCurrency },
      { header: 'Deposit', key: 'deposit', formatter: formatCurrency },
      { header: 'Deposit Collected', key: 'depositCollected', formatter: formatCurrency },
      { header: 'Status', key: 'status' },
      { header: 'Lease Type', key: 'leaseType' },
      { header: 'Total Revenue', key: 'totalRevenue', formatter: formatCurrency },
      { header: 'Payment Count', key: 'paymentCount' },
      { header: 'Created Date', key: 'createdAt', formatter: formatDate },
    ];

    exportToCsv(leaseReportData, columns, `leases-report-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPayments = () => {
    const columns: ReportColumn[] = [
      { header: 'Payment ID', key: 'id' },
      { header: 'Tenant Name', key: 'tenantName' },
      { header: 'Asset Name', key: 'assetName' },
      { header: 'Amount', key: 'amount', formatter: formatCurrency },
      { header: 'Due Date', key: 'dueDate', formatter: formatDateTime },
      { header: 'Paid Date', key: 'paidDate', formatter: (value) => value ? formatDateTime(value) : '' },
      { header: 'Status', key: 'status' },
      { header: 'Method', key: 'method' },
      { header: 'Reference Code', key: 'referenceCode' },
      { header: 'Days Past Due', key: 'daysPastDue', formatter: (value) => value !== undefined ? value.toString() : '' },
      { header: 'Created Date', key: 'createdAt', formatter: formatDate },
    ];

    exportToCsv(paymentReportData, columns, `payments-report-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive financial reports and data exports</p>
          </div>
          <div className="flex items-center text-blue-600">
            <BarChart3 className="h-8 w-8 mr-2" />
            <span className="text-sm font-medium">Data Analytics</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <ReportSummaryCards data={summaryData} />

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileDown className="h-5 w-5 mr-2 text-blue-600" />
              Data Export
            </h2>
            <p className="text-gray-600 mt-1">Export detailed reports in CSV format for analysis</p>
          </div>
        </div>

        <ReportExportButtons
          onExportAssets={handleExportAssets}
          onExportTenants={handleExportTenants}
          onExportLeases={handleExportLeases}
          onExportPayments={handleExportPayments}
        />
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assets Report</h3>
            <div className="text-2xl font-bold text-blue-600">{assetReportData.length}</div>
          </div>
          <p className="text-sm text-gray-600">
            Includes occupancy rates, revenue data, and tenant information for all assets.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tenants Report</h3>
            <div className="text-2xl font-bold text-green-600">{tenantReportData.length}</div>
          </div>
          <p className="text-sm text-gray-600">
            Complete tenant profiles with payment history and contact information.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Leases Report</h3>
            <div className="text-2xl font-bold text-purple-600">{leaseReportData.length}</div>
          </div>
          <p className="text-sm text-gray-600">
            Lease agreements with financial details and revenue tracking.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payments Report</h3>
            <div className="text-2xl font-bold text-amber-600">{paymentReportData.length}</div>
          </div>
          <p className="text-sm text-gray-600">
            All payment transactions with status tracking and reference codes.
          </p>
        </div>
      </div>
    </div>
  );
};