import { useState } from 'react';
import MapView from '@/components/MapView';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface GeofenceData {
  type: 'circle' | 'polygon';
  id: string;
  data: {
    center?: { lat: number; lng: number };
    radius?: number;
    vertices?: { lat: number; lng: number }[];
  };
}

const GPS = () => {
  const [drawMode, setDrawMode] = useState<'circle' | 'polygon' | null>(null);
  const [geofences, setGeofences] = useState<GeofenceData[]>([]);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [deleteGeofenceId, setDeleteGeofenceId] = useState<string | null>(null);
  const [highlightGeofenceId, setHighlightGeofenceId] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

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
          <ResultsPanel 
            geofences={geofences} 
            onDelete={handleDelete}
            onHighlight={setHighlightGeofenceId}
            highlightedId={highlightGeofenceId}
          />
        </div>
      </div>
    </div>
  );
};

export default GPS;