import React, { useMemo, useState } from 'react';
import { regionsData } from '../components/Home/regionsData';
import { RegionContext } from './RegionContext';
import type { RegionContextValue, RegionId } from './RegionContext';

interface RegionProviderProps {
  children: React.ReactNode;
}

export const RegionProvider: React.FC<RegionProviderProps> = ({ children }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('national');

  const value = useMemo<RegionContextValue>(() => {
    const selectedRegion = regionsData.find((region) => region.id === selectedRegionId) ?? null;

    return {
      selectedRegionId,
      setSelectedRegionId,
      selectedRegion,
      isNational: selectedRegion === null,
      regions: regionsData,
    };
  }, [selectedRegionId]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};
