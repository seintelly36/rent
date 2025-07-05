import React from 'react';
import { DollarSign, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import { CollectionSummary } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface CollectionSummaryCardsProps {
  summary: CollectionSummary;
}

export const CollectionSummaryCards: React.FC<CollectionSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total to Collect</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAmountToCollect)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-500">{summary.activeLeases} active leases</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOverdueAmount)}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-500">{summary.leasesWithOverdue} leases overdue</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Leases</p>
            <p className="text-2xl font-bold text-green-600">{summary.activeLeases}</p>
          </div>
          <FileText className="h-8 w-8 text-green-600" />
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-500">of {summary.totalLeases} total</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {summary.totalAmountToCollect > 0 
                ? Math.round(((summary.totalAmountToCollect - summary.totalOverdueAmount) / summary.totalAmountToCollect) * 100)
                : 100
              }%
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
        <div className="mt-2">
          <span className="text-sm text-gray-500">current period</span>
        </div>
      </div>
    </div>
  );
};