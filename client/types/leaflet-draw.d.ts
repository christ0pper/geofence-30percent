import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Draw {
    class Circle {
      constructor(map: L.Map, options?: any);
      enable(): void;
      disable(): void;
    }

    class Polygon {
      constructor(map: L.Map, options?: any);
      enable(): void;
      disable(): void;
    }

    namespace Event {
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
    }
  }

  namespace drawLocal {
    // This is just a minimal declaration to make the module importable
    // In a real implementation, you would define the full structure
    const draw: any;
    const edit: any;
  }
}