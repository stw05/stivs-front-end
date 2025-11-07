import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection } from 'geojson';
import './KazakhstanMap.css';
import { regionsData } from './regionsData';
import type { RegionType } from './regionsData';
import mapGeoJsonRaw from '../../assets/geo/kazakhstan-adm1.geojson?raw';

const featureCollectionData = JSON.parse(mapGeoJsonRaw) as FeatureCollection;

interface KazakhstanMapProps {
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
}

type MapFeature = {
  id: string;
  path: string;
  centroid: [number, number];
  label: [number, number];
  type: RegionType;
  shortName: string;
  name: string;
};

const KazakhstanMap: React.FC<KazakhstanMapProps> = ({ selectedRegionId, onRegionSelect }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionLookup = useMemo(() => {
    return new Map(regionsData.map((region) => [region.id, region]));
  }, []);

  const mapFeatures = useMemo(() => {
    const projection = geoMercator().fitSize([820, 560], featureCollectionData);
    const pathGenerator = geoPath(projection);

    return featureCollectionData.features
      .map((feature) => {
        const props = feature.properties as Feature['properties'] & {
          id?: string;
          name?: string;
          type?: string;
        };

        if (!props?.id) {
          return null;
        }

        const path = pathGenerator(feature as Feature) ?? '';
        const [cx, cy] = pathGenerator.centroid(feature as Feature);
        const regionMeta = regionLookup.get(props.id);
        const labelOffset = regionMeta?.labelOffset ?? { x: 0, y: 0 };

        const featureType: RegionType = (props.type as RegionType) ?? 'region';

        return {
          id: props.id,
          path,
          centroid: [cx, cy] as [number, number],
          label: [cx + labelOffset.x, cy + labelOffset.y] as [number, number],
          type: featureType,
          shortName: regionMeta?.shortName ?? props.name ?? props.id,
          name: regionMeta?.name ?? props.name ?? props.id,
        } satisfies MapFeature;
      })
      .filter((item): item is MapFeature => item !== null);
  }, [regionLookup]);

  const regionFeatures = useMemo(
    () => mapFeatures.filter((feature) => feature.type === 'region'),
    [mapFeatures],
  );

  const cityFeatures = useMemo(
    () => mapFeatures.filter((feature) => feature.type === 'city'),
    [mapFeatures],
  );

  const handleSelect = useCallback(
    (regionId: string) => {
      onRegionSelect(regionId);
    },
    [onRegionSelect],
  );

  const renderFeature = useCallback(
    (feature: MapFeature) => {
      const isSelected = feature.id === selectedRegionId;
      const isHovered = feature.id === hoveredRegion;
      const isCity = feature.type === 'city';

      return (
        <g key={feature.id} className="region-group">
          <path
            d={feature.path}
            tabIndex={isCity ? -1 : 0}
            role={isCity ? undefined : 'button'}
            aria-label={`Регион ${feature.name}`}
            aria-pressed={isCity ? undefined : isSelected}
            className={clsx('region-shape', {
              selected: isSelected,
              hovered: isHovered && !isSelected,
            })}
            onMouseEnter={!isCity ? () => setHoveredRegion(feature.id) : undefined}
            onMouseLeave={!isCity ? () => setHoveredRegion(null) : undefined}
            onFocus={!isCity ? () => setHoveredRegion(feature.id) : undefined}
            onBlur={!isCity ? () => setHoveredRegion(null) : undefined}
            onKeyDown={!isCity
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(feature.id);
                  }
                }
              : undefined}
            onClick={!isCity ? () => handleSelect(feature.id) : undefined}
            style={isCity ? { pointerEvents: 'none' } : undefined}
          />
          {isCity && (
            <circle
              className={clsx('city-marker', {
                selected: isSelected,
                hovered: isHovered && !isSelected,
              })}
              cx={feature.centroid[0]}
              cy={feature.centroid[1]}
              r={10}
              tabIndex={0}
              role="button"
              aria-label={`Город ${feature.name}`}
              aria-pressed={isSelected}
              onMouseEnter={() => setHoveredRegion(feature.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onFocus={() => setHoveredRegion(feature.id)}
              onBlur={() => setHoveredRegion(null)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelect(feature.id);
                }
              }}
              onClick={() => handleSelect(feature.id)}
            />
          )}
          <text x={feature.label[0]} y={feature.label[1]} className="region-label">
            {feature.shortName}
          </text>
        </g>
      );
    },
    [handleSelect, hoveredRegion, selectedRegionId],
  );

  return (
    <svg
      viewBox="0 0 820 560"
      className="map-svg"
      role="img"
      aria-labelledby="kazakhstanMapTitle"
    >
      <title id="kazakhstanMapTitle">Карта Казахстана по регионам</title>
      <defs>
        <filter
          id="regionShadow"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(15, 23, 42, 0.25)" />
        </filter>
      </defs>
      <g filter="url(#regionShadow)">
        {regionFeatures.map(renderFeature)}
        {cityFeatures.map(renderFeature)}
      </g>
    </svg>
  );
};

export default KazakhstanMap;
