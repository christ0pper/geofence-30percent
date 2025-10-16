import { Circle, Pentagon, Trash2, Save, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ControlPanelProps {
  drawMode: 'circle' | 'polygon' | null;
  onModeChange: (mode: 'circle' | 'polygon' | null) => void;
  onClearAll: () => void;
  onSave: () => void;
  hasGeofences: boolean;
}

const ControlPanel = ({ drawMode, onModeChange, onClearAll, onSave, hasGeofences }: ControlPanelProps) => {
  const handleLocationClick = () => {
    if ('geolocation' in navigator) {
      toast.loading('Getting your location...', { id: 'geolocation' });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Dispatch custom event to recenter map
          const event = new CustomEvent('recenterMap', {
            detail: { lat: latitude, lng: longitude }
          });
          window.dispatchEvent(event);
          toast.success('Map centered to your location', { id: 'geolocation' });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          toast.error(errorMessage, { id: 'geolocation' });
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <>
      {/* Mobile Layout - Bottom Toolbar */}
      <div className="md:hidden glass-panel p-4 rounded-t-3xl border-t border-border shadow-2xl backdrop-blur-lg">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button
            variant={drawMode === 'circle' ? 'default' : 'outline'}
            size="lg"
            className="h-16 text-base touch-target font-semibold"
            onClick={() => onModeChange(drawMode === 'circle' ? null : 'circle')}
          >
            <Circle className="w-6 h-6 mr-2" />
            Circle
          </Button>
          <Button
            variant={drawMode === 'polygon' ? 'default' : 'outline'}
            size="lg"
            className="h-16 text-base touch-target font-semibold"
            onClick={() => onModeChange(drawMode === 'polygon' ? null : 'polygon')}
          >
            <Pentagon className="w-6 h-6 mr-2" />
            Polygon
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 touch-target"
            onClick={handleLocationClick}
          >
            <Crosshair className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 touch-target"
            onClick={onClearAll}
            disabled={!hasGeofences}
          >
            <Trash2 className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="h-14 touch-target bg-secondary hover:bg-secondary/90 font-semibold"
            onClick={onSave}
            disabled={!hasGeofences}
          >
            <Save className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Floating Panel */}
      <div className="hidden md:block glass-panel p-4 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Drawing Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={drawMode === 'circle' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => onModeChange(drawMode === 'circle' ? null : 'circle')}
            >
              <Circle className="w-4 h-4 mr-2" />
              Circle
            </Button>
            <Button
              variant={drawMode === 'polygon' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => onModeChange(drawMode === 'polygon' ? null : 'polygon')}
            >
              <Pentagon className="w-4 h-4 mr-2" />
              Polygon
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLocationClick}
          >
            <Crosshair className="w-4 h-4 mr-2" />
            My Location
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClearAll}
            disabled={!hasGeofences}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            className="w-full bg-secondary hover:bg-secondary/90"
            onClick={onSave}
            disabled={!hasGeofences}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Boundary
          </Button>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
