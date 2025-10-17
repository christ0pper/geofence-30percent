import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import type { IoTDeviceData } from '@/types/iot';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import IoTDataBox from '@/components/IoTDataBox';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// Add Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, getDocs, getDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';

// Firebase configuration from the working firebase.js file
const firebaseConfig = {
  apiKey: "AIzaSyDPpAZ0SCckxwOBafTm81ng5DRVg_4WTJI",
  authDomain: "twodevice-d1964.firebaseapp.com",
  projectId: "twodevice-d1964",
  storageBucket: "twodevice-d1964.firebasestorage.app",
  messagingSenderId: "396770363161",
  appId: "1:396770363161:web:c250437a057e5383a12788",
  measurementId: "G-BVN4WJ60LJ"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add a check to ensure db is properly initialized
console.log('Firebase app initialized:', !!app);
console.log('Firestore db initialized:', !!db);

// Test basic Firestore connectivity
getDocs(collection(db, 'devices')).then((snapshot) => {
  console.log('Basic Firestore connectivity test - documents in devices collection:', snapshot.size);
}).catch((error) => {
  console.error('Basic Firestore connectivity test failed:', error);
});

interface GeofenceData {
  type: 'circle' | 'polygon';
  id: string;
  data: {
    center?: { lat: number; lng: number };
    radius?: number;
    vertices?: { lat: number; lng: number }[];
  };
}

// Add interface for IoT GPS data

const GPS = () => {
  const [drawMode, setDrawMode] = useState<'circle' | 'polygon' | null>(null);
  const [geofences, setGeofences] = useState<GeofenceData[]>([]);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [deleteGeofenceId, setDeleteGeofenceId] = useState<string | null>(null);
  const [highlightGeofenceId, setHighlightGeofenceId] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  // Add state for IoT device data
  const [iotData, setIotData] = useState<IoTDeviceData | null>(null);
  // Add state to track geofence status
  const [geofenceStatus, setGeofenceStatus] = useState<Record<string, boolean>>({});

  const handleGeofenceCreated = (geofence: GeofenceData) => {
    toast.success(`${geofence.type === 'circle' ? 'Circle' : 'Polygon'} geofence created!`);
    setDrawMode(null); // Reset draw mode after creation

    // Auto-open data sheet on mobile and provide light haptic feedback
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIsMobileSheetOpen(true);
      if ('vibrate' in navigator) {
        try { (navigator as any).vibrate?.(30); } catch {}
      }
    }
  };

  const handleGeofencesChange = (updatedGeofences: GeofenceData[]) => {
    setGeofences(updatedGeofences);
    // Initialize geofence status tracking
    const newStatus: Record<string, boolean> = {};
    updatedGeofences.forEach(geofence => {
      newStatus[geofence.id] = geofenceStatus[geofence.id] ?? false;
    });
    setGeofenceStatus(newStatus);
  };

  const handleModeChange = (mode: 'circle' | 'polygon' | null) => {
    setDrawMode(mode);
    if (mode) {
      const isMobile = window.innerWidth < 768;
      if (mode === 'circle') {
        toast.info(isMobile ? 'Tap center, drag to set radius, tap to finish.' : 'Click to set center, drag to set radius, click again to finish.');
      } else {
        toast.info(isMobile ? 'Tap to add points. Double-tap to finish polygon.' : 'Click to add points. Double-click to finish polygon.');
      }
    }
  };

  const handleClearAll = () => {
    setClearTrigger(prev => prev + 1);
    setGeofences([]);
    setDeleteGeofenceId(null);
    toast.info('All geofences cleared');
  };

  const handleDelete = (id: string) => {
    setDeleteGeofenceId(id);
    setHighlightGeofenceId(null);
    // Reset after a short delay to allow for future deletions of the same ID
    setTimeout(() => setDeleteGeofenceId(null), 100);
    toast.success('Geofence removed');
  };

  const handleMapReady = () => {
    setIsMapLoading(false);
  };

  // Handler for IoT data updates
  const handleIoTDataUpdate = (data: IoTDeviceData) => {
    console.log('IoT Data Update Received:', data);
    console.log('Setting iotData state to:', data);
    setIotData(data);
    
    // Check geofence boundaries
    checkGeofenceBoundaries(data);
  };

  // Function to check if a point is inside a circle geofence
  const isPointInCircle = (point: { lat: number; lng: number }, center: { lat: number; lng: number }, radius: number): boolean => {
    const latDiff = point.lat - center.lat;
    const lngDiff = point.lng - center.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    // Approximate conversion: 1 degree ≈ 111 km
    const distanceInMeters = distance * 111000;
    return distanceInMeters <= radius;
  };

  // Function to check if a point is inside a polygon geofence using ray casting algorithm
  const isPointInPolygon = (point: { lat: number; lng: number }, vertices: { lat: number; lng: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].lng, yi = vertices[i].lat;
      const xj = vertices[j].lng, yj = vertices[j].lat;
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
          && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Function to check geofence boundaries and trigger alerts
  const checkGeofenceBoundaries = (data: IoTDeviceData) => {
    const point = { lat: data.lat, lng: data.lon };
    const newStatus: Record<string, boolean> = { ...geofenceStatus };
    let statusChanged = false;

    geofences.forEach(geofence => {
      let inside = false;
      
      if (geofence.type === 'circle' && geofence.data.center && geofence.data.radius) {
        inside = isPointInCircle(point, geofence.data.center, geofence.data.radius);
      } else if (geofence.type === 'polygon' && geofence.data.vertices) {
        inside = isPointInPolygon(point, geofence.data.vertices);
      }
      
      const previousStatus = geofenceStatus[geofence.id] ?? false;
      if (previousStatus !== inside) {
        newStatus[geofence.id] = inside;
        statusChanged = true;
        
        // Trigger appropriate toast notification
        if (inside) {
          toast.success('Device entered geofence!');
        } else {
          toast.warning('Device left geofence!');
        }
      }
    });

    if (statusChanged) {
      setGeofenceStatus(newStatus);
    }
  };

  const handleSave = () => {
    console.log('=== GEOFENCE BOUNDARY DATA ===');
    geofences.forEach((geofence, index) => {
      console.log(`\nGeofence #${index + 1}:`);
      console.log(`Type: ${geofence.type}`);
      if (geofence.type === 'circle') {
        console.log('Center:', geofence.data.center);
        console.log('Radius (meters):', geofence.data.radius);
      } else {
        console.log('Vertices:', geofence.data.vertices);
      }
    });
    console.log('\n=== JSON FORMAT ===');
    console.log(JSON.stringify(geofences, null, 2));
    console.log('=============================');
    
    toast.success('Boundary data saved to console!');
  };

  // Add Firebase connection effect
  useEffect(() => {
    // Replace WebSocket with Firebase listener
    // Assuming you're using a specific device ID, e.g., 'phone1'
    const deviceId = 'phone1'; // This should be configurable
    
    console.log('Setting up Firebase listener for device:', deviceId);
    console.log('Firebase app initialized:', !!app);
    console.log('Firestore db initialized:', !!db);
    
    // NEW: Fetch data from the specific path mentioned by user
    const fetchSpecificFirebaseData = async () => {
      try {
        console.log('Fetching Firebase data from devices/test-device/location/test-doc');
        
        // Fetch the specific document directly
        const docRef = doc(db, 'devices', 'test-device', 'location', 'test-doc');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          console.log('Firebase data retrieved from specific document:', data);
          
          // Handle timestamp conversion more robustly
          let timestampStr = new Date().toISOString();
          if (data.timestamp) {
            try {
              // Handle Firestore Timestamp objects
              if (data.timestamp.toDate && typeof data.timestamp.toDate === 'function') {
                timestampStr = data.timestamp.toDate().toISOString();
              } else if (data.timestamp instanceof Date) {
                timestampStr = data.timestamp.toISOString();
              } else if (typeof data.timestamp === 'string') {
                timestampStr = new Date(data.timestamp).toISOString();
              } else if (typeof data.timestamp === 'number') {
                timestampStr = new Date(data.timestamp).toISOString();
              } else {
                // If it's a Firestore Timestamp-like object with seconds/nanoseconds
                if (data.timestamp.seconds !== undefined) {
                  timestampStr = new Date(data.timestamp.seconds * 1000).toISOString();
                }
              }
            } catch (e) {
              console.error('Error converting timestamp:', e);
              timestampStr = new Date().toISOString();
            }
          }
          
          // Create IoTDeviceData object from Firebase data - ONLY using actual Firebase values
          const iotData: IoTDeviceData = {
            lat: data.lat !== undefined ? Number(data.lat) : (data.latitude !== undefined ? Number(data.latitude) : 0),
            lon: data.lon !== undefined ? Number(data.lon) : (data.longitude !== undefined ? Number(data.longitude) : 0),
            speed: data.speed !== undefined ? Number(data.speed) : 0,
            satellites: data.satellites !== undefined ? Number(data.satellites) : 0,
            altitude: data.altitude !== undefined ? Number(data.altitude) : 0,
            timestamp: timestampStr
          };
          
          console.log('Specific Firebase data processed:', iotData);
          handleIoTDataUpdate(iotData);
        } else {
          console.log('No such document in devices/test-device/location/test-doc!');
        }
      } catch (error) {
        console.error('Error fetching Firebase data:', error);
      }
    };
    
    // Fetch the specific data immediately
    fetchSpecificFirebaseData();
    
    // Set up periodic check for the specific document every 5 seconds
    const specificDataInterval = setInterval(fetchSpecificFirebaseData, 5000);
    
    // Set up periodic check in case listener doesn't trigger
    const periodicCheck = setInterval(() => {
      console.log('Performing periodic check for device data...');
      fetchSpecificFirebaseData();
    }, 10000); // Check every 10 seconds
    
    // Clean up listeners and interval
    return () => {
      clearInterval(periodicCheck);
      clearInterval(specificDataInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Main Content - Full Screen */}
      <div className="flex-1 flex relative h-screen">
        {/* Loading Overlay */}
        {isMapLoading && (
          <div className="absolute inset-0 z-50 bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-lg font-semibold text-foreground">Loading Map...</p>
            </div>
          </div>
        )}
        
        {/* Map Container - Full screen on mobile */}
        <div className="flex-1 relative">
          <MapView
            drawMode={drawMode}
            onGeofenceCreated={handleGeofenceCreated}
            onGeofencesChange={handleGeofencesChange}
            clearTrigger={clearTrigger}
            deleteGeofenceId={deleteGeofenceId}
            highlightGeofenceId={highlightGeofenceId}
            onMapReady={handleMapReady}
            onIoTDataUpdate={handleIoTDataUpdate}
            iotDeviceData={iotData} // Pass the IoT device data to MapView
          />

          {/* Mobile inline instructions while drawing */}
          {drawMode && (
            <div className="md:hidden absolute top-4 inset-x-4 z-[1050] flex justify-center">
              <div className="px-3 py-2 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-md text-xs font-medium">
                {drawMode === 'circle' ? 'Tap center, drag to set radius, tap to finish' : 'Tap to add points, double-tap to finish'}
              </div>
            </div>
          )}
          
          {/* Mobile Bottom Controls */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] mobile-toolbar">
            <ControlPanel
              drawMode={drawMode}
              onModeChange={handleModeChange}
              onClearAll={handleClearAll}
              onSave={handleSave}
              hasGeofences={geofences.length > 0}
            />
          </div>

          {/* Mobile Results Sheet (controlled) */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileSheetOpen(true)} className="fixed bottom-24 right-4 z-[2001] bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-3 text-sm font-semibold shadow-lg active:scale-95 transition-transform">
              View Data ({geofences.length})
            </button>
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetContent side="bottom" className="h-[85vh] px-6 z-[2100]">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-xl">Geofence Data ({geofences.length})</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(85vh-100px)] -mx-2 px-2">
                  <ResultsPanel 
                    geofences={geofences} 
                    onDelete={handleDelete}
                    onHighlight={setHighlightGeofenceId}
                    highlightedId={highlightGeofenceId}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Floating Control Panel */}
          <div className="hidden md:block absolute top-4 left-4 z-[1000] w-64">
            <ControlPanel
              drawMode={drawMode}
              onModeChange={handleModeChange}
              onClearAll={handleClearAll}
              onSave={handleSave}
              hasGeofences={geofences.length > 0}
            />
          </div>
        </div>

        {/* Desktop Results Sidebar */}
        <div className="hidden md:block w-96 bg-background border-l border-border p-4 overflow-y-auto">
          {/* IoT Data Box - Always visible at top */}
          <div className="mb-4">
            <IoTDataBox data={iotData} />
          </div>
          
          {/* Geofence Results */}
          <ResultsPanel 
            geofences={geofences} 
            onDelete={handleDelete}
            onHighlight={setHighlightGeofenceId}
            highlightedId={highlightGeofenceId}
          />
        </div>
      </div>
      
      {/* Mobile IoT Data Box - Fixed at bottom above controls */}
      <div className="md:hidden fixed bottom-24 left-4 right-4 z-[1000]">
        <IoTDataBox data={iotData} />
      </div>
    </div>
  );
};

export default GPS;