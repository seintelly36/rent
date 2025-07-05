import { useState, useEffect, useMemo } from 'react';
import { Lease, Payment, Asset, Tenant, LeaseCollectionData, CollectionSummary } from '../types';
import { calculateCollectionData, calculateCollectionSummary } from '../utils/paymentCalculations';

interface UseCollectionsProps {
  leases: Lease[];
  payments: Payment[];
  assets: Asset[];
  tenants: Tenant[];
}

export const useCollections = ({ leases, payments, assets, tenants }: UseCollectionsProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate collections data
  const collectionsData = useMemo(() => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = new Date();
      const data: LeaseCollectionData[] = [];

      for (const lease of leases) {
        const asset = assets.find(a => a.id === lease.assetId);
        const tenant = tenants.find(t => t.id === lease.tenantId);

        if (asset && tenant) {
          const collectionData = calculateCollectionData(
            lease,
            payments,
            asset,
            tenant,
            currentDate
          );
          data.push(collectionData);
        }
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate collections data');
      return [];
    } finally {
      setLoading(false);
    }
  }, [leases, payments, assets, tenants]);

  // Calculate summary
  const summary: CollectionSummary = useMemo(() => {
    return calculateCollectionSummary(collectionsData);
  }, [collectionsData]);

  // Filter active collections (leases that need attention)
  const activeCollections = useMemo(() => {
    return collectionsData.filter(data => data.isActive && data.amountToCollect > 0);
  }, [collectionsData]);

  // Filter overdue collections
  const overdueCollections = useMemo(() => {
    return collectionsData.filter(data => 
      data.isActive && 
      data.intervals.some(interval => interval.isIncurred && !interval.isPaid)
    );
  }, [collectionsData]);

  useEffect(() => {
    setLoading(false);
  }, [collectionsData]);

  return {
    collectionsData,
    activeCollections,
    overdueCollections,
    summary,
    loading,
    error,
  };
};