import React, { useState } from 'react';
import clsx from 'clsx';
import './KazakhstanMap.css';
import { regionsData } from './regionsData';

interface KazakhstanMapProps {
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
}

const KazakhstanMap: React.FC<KazakhstanMapProps> = ({ selectedRegionId, onRegionSelect }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleSelect = (regionId: string) => {
    onRegionSelect(regionId);
  };

  return (
    <svg
      viewBox="0 0 820 560"
      className="map-svg"
      role="img"
      aria-labelledby="kazakhstanMapTitle"
    >
      <title id="kazakhstanMapTitle">Карта Казахстана по регионам</title>
      <defs>
        <filter id="regionShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(15, 23, 42, 0.25)" />
        </filter>
      </defs>
      <g filter="url(#regionShadow)">
        {regionsData.map((region) => {
          const isSelected = region.id === selectedRegionId;
          const isHovered = region.id === hoveredRegion;
          return (
            <g key={region.id} className="region-group">
              <path
                d={region.path}
                tabIndex={0}
                role="button"
                aria-label={`Регион ${region.name}`}
                aria-pressed={isSelected}
                className={clsx('region-shape', {
                  selected: isSelected,
                  hovered: isHovered && !isSelected,
                })}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onFocus={() => setHoveredRegion(region.id)}
                onBlur={() => setHoveredRegion(null)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(region.id);
                  }
                }}
                onClick={() => handleSelect(region.id)}
              />
              <text
                x={region.labelPosition.x}
                y={region.labelPosition.y}
                className="region-label"
              >
                {region.shortName}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default KazakhstanMap;
