import React from 'react';
import { Download, FileText, Users, Building2, CreditCard } from 'lucide-react';

interface ReportExportButtonsProps {
  onExportAssets: () => void;
  onExportTenants: () => void;
  onExportLeases: () => void;
  onExportPayments: () => void;
  isLoading?: boolean;
}

export const ReportExportButtons: React.FC<ReportExportButtonsProps> = ({
  onExportAssets,
  onExportTenants,
  onExportLeases,
  onExportPayments,
  isLoading = false,
}) => {
  const buttons = [
    {
      label: 'Export Assets',
      icon: Building2,
      onClick: onExportAssets,
      description: 'Asset details, occupancy, and revenue data',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Export Tenants',
      icon: Users,
      onClick: onExportTenants,
      description: 'Tenant information and payment history',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      label: 'Export Leases',
      icon: FileText,
      onClick: onExportLeases,
      description: 'Lease agreements and financial details',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      label: 'Export Payments',
      icon: CreditCard,
      onClick: onExportPayments,
      description: 'Payment transactions and status',
      color: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.label}
            onClick={button.onClick}
            disabled={isLoading}
            className={`${button.color} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all duration-200">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{button.label}</h3>
                <p className="text-sm opacity-90">{button.description}</p>
              </div>
              <div className="flex items-center text-sm opacity-75">
                <Download className="h-4 w-4 mr-1" />
                CSV
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};