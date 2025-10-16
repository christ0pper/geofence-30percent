import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Satellite, MapPin, Gauge, Activity } from 'lucide-react';

interface IoTDeviceData {
  lat: number;
  lon: number;
  speed: number;
  satellites: number;
  altitude: number;
  timestamp: string;
}

interface IoTDataBoxProps {
  data: IoTDeviceData | null;
}

const IoTDataBox = ({ data }: IoTDataBoxProps) => {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-red-500" />
            IoT Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Waiting for device data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-red-500" />
          IoT Device Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Latitude</p>
              <p className="font-mono text-sm">{data.lat.toFixed(6)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Longitude</p>
              <p className="font-mono text-sm">{data.lon.toFixed(6)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="font-mono text-sm">{data.speed.toFixed(1)} km/h</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Satellites</p>
              <p className="font-mono text-sm">{data.satellites}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Altitude</p>
              <p className="font-mono text-sm">{data.altitude.toFixed(1)} m</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Last Update</p>
              <p className="text-sm">
                {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IoTDataBox;