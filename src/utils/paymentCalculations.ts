import { Lease, Payment, Asset, Tenant, CollectionInterval, LeaseCollectionData, CollectionSummary } from '../types';
import { generatePaymentIntervals, convertMinutesToValueAndUnit } from './dateUtils';

export const calculateCollectionData = (
  lease: Lease,
  payments: Payment[],
  asset: Asset,
  tenant: Tenant,
  currentDate: Date = new Date()
): LeaseCollectionData => {
  // Generate payment intervals for the lease
  const { value, unit } = convertMinutesToValueAndUnit(lease.chargePeriodMinutes);
  const intervals = generatePaymentIntervals(
    lease.startDate,
    value,
    unit,
    lease.frequency
  );

  // Calculate total payments for this lease
  const leasePayments = payments.filter(p => 
    p.tenantId === lease.tenantId && 
    p.assetId === lease.assetId &&
    p.status === 'paid'
  );
  
  const totalPayments = leasePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPeriodsPaid = totalPayments / lease.rentAmount;

  // Debug logging for collections
  console.log('Collection calculation for lease:', lease.id);
  console.log('- Lease payments found:', leasePayments.length);
  console.log('- Total payments amount:', totalPayments);
  console.log('- Rent amount:', lease.rentAmount);
  console.log('- Total periods paid:', totalPeriodsPaid);

  // Determine current period based on current date
  let currentPeriod = 0;
  for (let i = 0; i < intervals.length; i++) {
    const intervalStart = new Date(intervals[i].start);
    if (currentDate >= intervalStart) {
      currentPeriod = i + 1;
    } else {
      break;
    }
  }

  console.log('- Current period:', currentPeriod);
  console.log('- Intervals generated:', intervals.length);

  // Create collection intervals with payment status
  const collectionIntervals: CollectionInterval[] = intervals.map((interval, index) => {
    const periodNumber = index + 1;
    const startDate = new Date(interval.start);
    const endDate = new Date(interval.end);
    const isIncurred = currentDate >= startDate;
    const isPaid = periodNumber <= totalPeriodsPaid;
    
    return {
      periodNumber,
      startDate: interval.start,
      endDate: interval.end,
      isPaid,
      isIncurred,
      amount: lease.rentAmount,
    };
  });

  // Calculate periods to collect and amount
  const periodsToCollect = Math.max(0, currentPeriod - totalPeriodsPaid);
  const amountToCollect = periodsToCollect * lease.rentAmount;

  console.log('- Periods to collect:', periodsToCollect);
  console.log('- Amount to collect:', amountToCollect);
  console.log('- Is active:', isActive);

  // Check if lease is active
  const isActive = lease.status === 'active' && new Date(lease.endDate) > currentDate;

  return {
    lease,
    asset,
    tenant,
    intervals: collectionIntervals,
    totalPayments,
    totalPeriodsPaid,
    currentPeriod,
    periodsToCollect,
    amountToCollect,
    isActive,
  };
};

export const calculateCollectionSummary = (collectionsData: LeaseCollectionData[]): CollectionSummary => {
  const activeCollections = collectionsData.filter(data => data.isActive);
  
  return {
    totalLeases: collectionsData.length,
    activeLeases: activeCollections.length,
    totalAmountToCollect: activeCollections.reduce((sum, data) => sum + data.amountToCollect, 0),
    totalOverdueAmount: activeCollections.reduce((sum, data) => {
      const overdueAmount = data.intervals
        .filter(interval => interval.isIncurred && !interval.isPaid)
        .reduce((intervalSum, interval) => intervalSum + interval.amount, 0);
      return sum + overdueAmount;
    }, 0),
    leasesWithOverdue: activeCollections.filter(data => 
      data.intervals.some(interval => interval.isIncurred && !interval.isPaid)
    ).length,
  };
};

export const getLeaseCollectionDataForLease = (
  lease: Lease,
  payments: Payment[],
  asset: Asset,
  tenant: Tenant,
  currentDate: Date = new Date()
): LeaseCollectionData => {
  return calculateCollectionData(lease, payments, asset, tenant, currentDate);
};