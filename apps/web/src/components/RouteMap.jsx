import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { routeCategoryMeta, SOPOT_CENTER } from '@/data/routes';

function RefreshMapSize({ path }) {
  const map = useMap();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [map, path]);

  return null;
}

function FitRouteBounds({ path }) {
  const map = useMap();

  useEffect(() => {
    if (path.length >= 2) {
      map.fitBounds(path, { padding: [24, 24] });
      return;
    }

    if (path.length === 1) {
      map.flyTo(path[0], 15, { duration: 0.5 });
      return;
    }

    map.flyTo(SOPOT_CENTER, 13, { duration: 0.5 });
  }, [map, path]);

  return null;
}

function DraftRouteEvents({ onAddPoint }) {
  useMapEvents({
    click: (event) => {
      onAddPoint([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function RouteMapPreview({ path, category, interactive = false, editable = false, onAddPoint = () => {} }) {
  const theme = routeCategoryMeta[category] ?? routeCategoryMeta.piesza;
  const mapKey = `${category}-${path.map((point) => `${point[0]}:${point[1]}`).join('|')}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--outline-soft)] bg-[#dfeef2]">
      <MapContainer
        key={mapKey}
        center={SOPOT_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        dragging={interactive || editable}
        doubleClickZoom={interactive || editable}
        touchZoom={interactive || editable}
        className="h-72 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RefreshMapSize path={path} />
        <FitRouteBounds path={path} />

        {editable && <DraftRouteEvents onAddPoint={onAddPoint} />}

        {path.length >= 2 && (
          <Polyline
            positions={path}
            pathOptions={{
              color: theme.lineColor,
              weight: 6,
              opacity: 0.88,
            }}
          />
        )}

        {path.map((point, index) => {
          const isStart = index === 0;
          const isEnd = index === path.length - 1;

          return (
            <CircleMarker
              key={`${point[0]}-${point[1]}-${index}`}
              center={point}
              radius={isStart || isEnd ? 8 : 6}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: isStart ? '#1f9d55' : isEnd ? '#d94841' : theme.lineColor,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                {isStart ? 'Start' : isEnd ? 'Koniec' : `Punkt ${index + 1}`}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
