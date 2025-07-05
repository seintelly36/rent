export interface AssetDetail {
  name: string;
  value: string | number;
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
  predefinedDetails: {
    name: string;
    type: 'text' | 'number' | 'boolean';
    required?: boolean;
  }[];
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  address: string;
  assetTypeId: string;
  details: AssetDetail[];
  tenantId?: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  createdAt: string;
}

export interface SocialMediaEntry {
  platform: string;
  handle: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  socialMedia: SocialMediaEntry[];
  otherInformation?: string;
  createdAt: string;
}

export interface Lease {
  id: string;
  assetId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  chargePeriodMinutes: number;
  frequency: number;
  deposit: number;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  leaseType: 'fixed_term' | 'month_to_month';
  notes?: string;
  depositCollectedAmount?: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  assetId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'cancelled';
  method?: 'cash' | 'check' | 'bank_transfer' | 'online' | 'adjustment';
  notes?: string;
  referenceCode?: string;
  createdAt: string;
}

export interface PaymentInterval {
  start: string;
  end: string;
}

export interface DashboardStats {
  totalAssets: number;
  occupiedAssets: number;
  totalTenants: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface CollectionInterval {
  periodNumber: number;
  startDate: string;
  endDate: string;
  isPaid: boolean;
  isIncurred: boolean;
  amount: number;
}

export interface LeaseCollectionData {
  lease: Lease;
  asset: Asset;
  tenant: Tenant;
  intervals: CollectionInterval[];
  totalPayments: number;
  totalPeriodsPaid: number;
  currentPeriod: number;
  periodsToCollect: number;
  amountToCollect: number;
  isActive: boolean;
}

export interface CollectionSummary {
  totalLeases: number;
  activeLeases: number;
  totalAmountToCollect: number;
  totalOverdueAmount: number;
  leasesWithOverdue: number;
}

export interface PaymentCollectionResult {
  paymentId: string;
  paymentAmount: number;
  paymentStatus: string;
  leaseUpdated: boolean;
  newDepositCollectedAmount: number;
}

export interface PeriodAdjustment {
  type: 'refund' | 'cancel';
  periodNumber: number;
  amount: number;
  reason: string;
}

export interface ReportColumn {
  header: string;
  key: string;
  formatter?: (value: any) => string;
}

export interface ReportData {
  [key: string]: any;
}

export interface AssetReportData extends ReportData {
  id: string;
  name: string;
  address: string;
  assetType: string;
  status: string;
  tenantName?: string;
  tenantEmail?: string;
  currentRent?: number;
  totalRevenue: number;
  totalPayments: number;
  occupancyRate: number;
  createdAt: string;
}

export interface TenantReportData extends ReportData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assetName?: string;
  assetAddress?: string;
  totalPaid: number;
  totalDue: number;
  paymentHistory: number;
  socialMediaCount: number;
  createdAt: string;
}

export interface LeaseReportData extends ReportData {
  id: string;
  tenantName: string;
  assetName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  depositCollected: number;
  status: string;
  leaseType: string;
  totalRevenue: number;
  paymentCount: number;
  createdAt: string;
}

export interface PaymentReportData extends ReportData {
  id: string;
  tenantName: string;
  assetName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  method?: string;
  referenceCode?: string;
  daysPastDue?: number;
  createdAt: string;
}