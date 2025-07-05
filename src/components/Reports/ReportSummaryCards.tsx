import React from 'react';
import { Building2, Users, FileText, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/csvUtils';

interface ReportSummaryData {
  totalAssets: number;
  totalTenants: number;
  totalLeases: number;
  totalPayments: number;
  totalRevenue: number;
  pendingAmount: number;
  occupancyRate: number;
  averageRent: number;
}

interface ReportSummaryCardsProps {
  data: ReportSummaryData;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'Total Assets',
      value: data.totalAssets.toString(),
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-600',
    },
    {
      title: 'Active Tenants',
      value: data.totalTenants.toString(),
      icon: Users,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-600',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-600',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(data.pendingAmount),
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      bgColor: 'bg-amber-600',
    },
    {
      title: 'Occupancy Rate',
      value: `${(data.occupancyRate * 100).toFixed(1)}%`,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600',
      bgColor: 'bg-emerald-600',
    },
    {
      title: 'Average Rent',
      value: formatCurrency(data.averageRent),
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
      bgColor: 'bg-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};