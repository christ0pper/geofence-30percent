import { MapPin, Ruler, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GeofenceData {
  type: 'circle' | 'polygon';
  id: string;
  data: {
    center?: { lat: number; lng: number };
    radius?: number;
    vertices?: { lat: number; lng: number }[];
  };
}

interface ResultsPanelProps {
  geofences: GeofenceData[];
  onDelete: (id: string) => void;
  onHighlight: (id: string | null) => void;
  highlightedId: string | null;
}

const ResultsPanel = ({ geofences, onDelete, onHighlight, highlightedId }: ResultsPanelProps) => {
  if (geofences.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No geofences drawn yet</p>
        <p className="text-xs mt-1">Select a drawing mode and click on the map to start</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {geofences.map((geofence, index) => (
            <div 
              key={geofence.id} 
              className={`p-4 rounded-lg space-y-3 cursor-pointer transition-all ${
                highlightedId === geofence.id 
                  ? 'bg-amber-500/20 border-2 border-amber-500' 
                  : 'bg-muted/50 hover:bg-muted/70'
              }`}
              onClick={() => onHighlight(highlightedId === geofence.id ? null : geofence.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={geofence.type === 'circle' ? 'default' : 'secondary'}>
                    {geofence.type === 'circle' ? 'Circle' : 'Polygon'} #{index + 1}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(geofence.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {geofence.type === 'circle' && geofence.data.center && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Center</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {geofence.data.center.lat.toFixed(6)}, {geofence.data.center.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Ruler className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Radius</p>
                      <p className="text-muted-foreground">
                        {geofence.data.radius?.toLocaleString()} meters
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {geofence.type === 'polygon' && geofence.data.vertices && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-secondary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-2">
                        Vertices ({geofence.data.vertices.length})
                      </p>
                      <div className="space-y-1">
                        {geofence.data.vertices.map((vertex, i) => (
                          <p key={i} className="text-muted-foreground font-mono text-xs">
                            {i + 1}. {vertex.lat.toFixed(6)}, {vertex.lng.toFixed(6)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
    </div>
  );
};

export default ResultsPanel;
