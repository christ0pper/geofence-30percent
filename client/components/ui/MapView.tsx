import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { IoTDeviceData } from '@/types/iot';

interface GeofenceData {
  type: 'circle' | 'polygon';
  id: string;
  data: {
    center?: { lat: number; lng: number };
    radius?: number;
    vertices?: { lat: number; lng: number }[];
  };
  layer: L.Layer;
}

interface MapViewProps {
  drawMode: 'circle' | 'polygon' | null;
  onGeofenceCreated: (geofence: Omit<GeofenceData, 'layer'>) => void;
  onGeofencesChange: (geofences: Omit<GeofenceData, 'layer'>[]) => void;
  clearTrigger: number;
  deleteGeofenceId: string | null;
  highlightGeofenceId: string | null;
  onMapReady: () => void;
  onIoTDataUpdate?: (data: IoTDeviceData) => void;
}

const MapView = ({ drawMode, onGeofenceCreated, onGeofencesChange, clearTrigger, deleteGeofenceId, highlightGeofenceId, onMapReady, onIoTDataUpdate }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const activeDrawerRef = useRef<L.Draw.Circle | L.Draw.Polygon | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const locationCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [geofences, setGeofences] = useState<GeofenceData[]>([]);
  const originalStylesRef = useRef<Map<string, any>>(new Map());
  // Add refs for IoT marker and data polling
  const iotMarkerRef = useRef<L.Marker | null>(null);
  const iotPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map with mobile-optimized settings
      const isMobile = window.innerWidth < 768;
      const map = L.map('map', {
        zoomControl: true,
        touchZoom: true,
        scrollWheelZoom: true,
        dragging: true,
      }).setView([20.5937, 78.9629], isMobile ? 4 : 5);
      
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      });
      
      tileLayer.on('load', () => {
        // Map tiles loaded, notify parent
        setTimeout(() => onMapReady(), 500);
      });
      
      tileLayer.addTo(map);
      // Mobile-friendly interactions
      map.doubleClickZoom.disable();
      map.boxZoom.disable();

      // Feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Temporarily disable interactions during drawing on mobile to avoid map panning
      const handleDrawStart = () => {
        map.dragging.disable();
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
      };
      const handleDrawStop = () => {
        map.dragging.enable();
        map.touchZoom.enable();
        map.scrollWheelZoom.enable();
      };
      map.on(L.Draw.Event.DRAWSTART as any, handleDrawStart);
      map.on(L.Draw.Event.DRAWSTOP as any, handleDrawStop);

      // Handle shape creation
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        const type = event.layerType;
        
        drawnItems.addLayer(layer);
        
        let geofenceData: Omit<GeofenceData, 'layer'>;
        const id = `geofence-${Date.now()}`;
        
        if (type === 'circle') {
          const circle = layer as L.Circle;
          const center = circle.getLatLng();
          const radius = circle.getRadius();
          
          geofenceData = {
            type: 'circle',
            id,
            data: {
              center: { lat: center.lat, lng: center.lng },
              radius: Math.round(radius),
            },
          };
        } else if (type === 'polygon') {
          const polygon = layer as L.Polygon;
          const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
          
          geofenceData = {
            type: 'polygon',
            id,
            data: {
              vertices: latLngs.map(ll => ({ lat: ll.lat, lng: ll.lng })),
            },
          };
        } else {
          return;
        }
        
        const newGeofence: GeofenceData = { ...geofenceData, layer };
        setGeofences(prev => {
          const updated = [...prev, newGeofence];
          onGeofencesChange(updated.map(({ layer, ...rest }) => rest));
          return updated;
        });
        onGeofenceCreated(geofenceData);

        // Re-enable interactions after a shape is created
        map.dragging.enable();
        map.touchZoom.enable();
        map.scrollWheelZoom.enable();
      });

      // Handle shape editing
      map.on(L.Draw.Event.EDITED, (event: any) => {
        const layers = event.layers;
        const updatedGeofences: GeofenceData[] = [];
        
        layers.eachLayer((layer: L.Layer) => {
          const existingGeofence = geofences.find(g => g.layer === layer);
          if (existingGeofence) {
            let updatedData;
            
            if (existingGeofence.type === 'circle') {
              const circle = layer as L.Circle;
              const center = circle.getLatLng();
              const radius = circle.getRadius();
              
              updatedData = {
                ...existingGeofence,
                data: {
                  center: { lat: center.lat, lng: center.lng },
                  radius: Math.round(radius),
                },
              };
            } else {
              const polygon = layer as L.Polygon;
              const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
              
              updatedData = {
                ...existingGeofence,
                data: {
                  vertices: latLngs.map(ll => ({ lat: ll.lat, lng: ll.lng })),
                },
              };
            }
            
            updatedGeofences.push(updatedData);
          }
        });
        
        setGeofences(prev => {
          const updated = prev.map(g => 
            updatedGeofences.find(ug => ug.id === g.id) || g
          );
          onGeofencesChange(updated.map(({ layer, ...rest }) => rest));
          return updated;
        });
      });

      // Handle shape deletion
      map.on(L.Draw.Event.DELETED, (event: any) => {
        const layers = event.layers;
        const deletedLayers: L.Layer[] = [];
        
        layers.eachLayer((layer: L.Layer) => {
          deletedLayers.push(layer);
        });
        
        setGeofences(prev => {
          const updated = prev.filter(g => !deletedLayers.includes(g.layer));
          onGeofencesChange(updated.map(({ layer, ...rest }) => rest));
          return updated;
        });
      });

      mapRef.current = map;

      // Create custom blue dot icon for user location
      const createLocationIcon = () => {
        return L.divIcon({
          className: 'custom-location-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
            </style>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      };

      // Create custom red dot icon for IoT device
      const createIoTIcon = () => {
        return L.divIcon({
          className: 'iot-marker',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              background: #ef4444;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse-red 1.5s infinite;
            "></div>
            <style>
              @keyframes pulse-red {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
              }
            </style>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
      };

      // Function to fetch and update IoT device location
      const fetchIoTLocation = async () => {
        try {
          const response = await fetch('/api/latest-location');
          if (response.ok) {
            const data: IoTDeviceData = await response.json();
            
            // Update marker position
            if (iotMarkerRef.current) {
              // Animate movement if marker already exists
              const currentPos = iotMarkerRef.current.getLatLng();
              const newPos = L.latLng(data.lat, data.lon);
              
              // Simple animation for marker movement
              iotMarkerRef.current.setLatLng(newPos);
            } else {
              // Create marker if it doesn't exist
              iotMarkerRef.current = L.marker([data.lat, data.lon], {
                icon: createIoTIcon(),
                zIndexOffset: 1001,
              }).addTo(map);
            }
            
            // Notify parent component of data update
            onIoTDataUpdate?.(data);
          }
        } catch (error) {
          console.error('Error fetching IoT location:', error);
        }
      };

      // Start polling for IoT location data every 5 seconds
      iotPollingIntervalRef.current = setInterval(fetchIoTLocation, 5000);
      // Fetch initial data immediately
      fetchIoTLocation();

      // Listen for recenter events
      const handleRecenter = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { lat, lng } = customEvent.detail;
        
        // Update or create location marker
        if (locationMarkerRef.current) {
          locationMarkerRef.current.setLatLng([lat, lng]);
        } else {
          locationMarkerRef.current = L.marker([lat, lng], {
            icon: createLocationIcon(),
            zIndexOffset: 1000,
          }).addTo(map);
        }
        
        // Update or create accuracy circle (10m radius for visualization)
        if (locationCircleRef.current) {
          locationCircleRef.current.setLatLng([lat, lng]);
        } else {
          locationCircleRef.current = L.circle([lat, lng], {
            radius: 10,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(map);
        }
        
        map.setView([lat, lng], 16, { animate: true });
      };
      
      window.addEventListener('recenterMap', handleRecenter);
      
      return () => {
        window.removeEventListener('recenterMap', handleRecenter);
        
        // Clean up location tracking
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        
        // Remove location marker and circle
        if (locationMarkerRef.current) {
          map.removeLayer(locationMarkerRef.current);
        }
        if (locationCircleRef.current) {
          map.removeLayer(locationCircleRef.current);
        }
        
        // Clean up IoT polling
        if (iotPollingIntervalRef.current) {
          clearInterval(iotPollingIntervalRef.current);
        }
        
        // Remove IoT marker
        if (iotMarkerRef.current && mapRef.current) {
          mapRef.current.removeLayer(iotMarkerRef.current);
        }
      };
    }
  }, []);

  // Handle draw mode changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Disable any active drawer first
    if (activeDrawerRef.current) {
      try {
        activeDrawerRef.current.disable();
      } catch (e) {
        // Drawer might already be disabled
      }
      activeDrawerRef.current = null;
    }

    // Ensure interactions are enabled when no draw mode
    if (!drawMode) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
    }

    // Enable new drawer if mode is selected
    if (drawMode === 'circle') {
      const circleDrawer = new L.Draw.Circle(map as any, {
        shapeOptions: {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          weight: 2,
        },
        repeatMode: false,
      });
      circleDrawer.enable();
      activeDrawerRef.current = circleDrawer;

      // Improve touch responsiveness and avoid accidental map moves
      (map as any).options.inertia = false;
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
    } else if (drawMode === 'polygon') {
      const polygonDrawer = new L.Draw.Polygon(map as any, {
        shapeOptions: {
          color: '#14b8a6',
          fillColor: '#14b8a6',
          fillOpacity: 0.3,
          weight: 2,
        },
        repeatMode: false,
      });
      polygonDrawer.enable();
      activeDrawerRef.current = polygonDrawer;

      // Also reduce accidental map moves while placing vertices
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
    }

    return () => {
      // Cleanup on unmount or mode change
      if (activeDrawerRef.current) {
        try {
          activeDrawerRef.current.disable();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      // Re-enable interactions when leaving draw mode
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
    };
  }, [drawMode]);

  // Handle clear all
  useEffect(() => {
    if (clearTrigger > 0 && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setGeofences([]);
      onGeofencesChange([]);
    }
  }, [clearTrigger]);

  // Handle individual geofence deletion
  useEffect(() => {
    if (deleteGeofenceId && drawnItemsRef.current) {
      const geofenceToDelete = geofences.find(g => g.id === deleteGeofenceId);
      if (geofenceToDelete) {
        drawnItemsRef.current.removeLayer(geofenceToDelete.layer);
        setGeofences(prev => {
          const updated = prev.filter(g => g.id !== deleteGeofenceId);
          onGeofencesChange(updated.map(({ layer, ...rest }) => rest));
          return updated;
        });
      }
    }
  }, [deleteGeofenceId]);

  // Handle geofence highlighting
  useEffect(() => {
    if (!highlightGeofenceId) {
      // Restore all layers to original styles
      geofences.forEach(g => {
        const layer = g.layer as any;
        const originalStyle = originalStylesRef.current.get(g.id);
        if (originalStyle && layer.setStyle) {
          layer.setStyle(originalStyle);
        }
      });
      return;
    }

    const geofenceToHighlight = geofences.find(g => g.id === highlightGeofenceId);
    if (geofenceToHighlight && mapRef.current) {
      const layer = geofenceToHighlight.layer as any;
      
      // Store original style if not already stored
      if (!originalStylesRef.current.has(highlightGeofenceId) && layer.options) {
        originalStylesRef.current.set(highlightGeofenceId, {
          color: layer.options.color,
          fillColor: layer.options.fillColor,
          fillOpacity: layer.options.fillOpacity,
          weight: layer.options.weight,
        });
      }

      // Reset all other layers
      geofences.forEach(g => {
        if (g.id !== highlightGeofenceId) {
          const otherLayer = g.layer as any;
          const originalStyle = originalStylesRef.current.get(g.id);
          if (originalStyle && otherLayer.setStyle) {
            otherLayer.setStyle(originalStyle);
          }
        }
      });

      // Highlight selected layer
      if (layer.setStyle) {
        layer.setStyle({
          color: '#fbbf24',
          fillColor: '#fbbf24',
          fillOpacity: 0.5,
          weight: 4,
        });
      }

      // Center map on the highlighted geofence
      if (layer.getBounds) {
        mapRef.current.fitBounds(layer.getBounds(), { padding: [50, 50] });
      } else if (layer.getLatLng) {
        mapRef.current.setView(layer.getLatLng(), 14);
      }
    }
  }, [highlightGeofenceId, geofences]);

  return (
    <div id="map" className="w-full h-full" />
  );
};

export default MapView;
