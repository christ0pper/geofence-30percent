import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// In-memory storage for location data (in production, you would use a database)
let latestLocationData: any = null;

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // Handle POST requests from IoT devices sending location data
  app.post("/api/location", (req, res) => {
    try {
      const locationData = req.body;
      
      // Validate required fields
      if (!locationData.deviceId || !locationData.lat || !locationData.lon) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields: deviceId, lat, lon" 
        });
      }
      
      // Store the latest location data
      latestLocationData = {
        ...locationData,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Received location data from device: ${locationData.deviceId}`);
      console.log(`Location: ${locationData.lat}, ${locationData.lon}`);
      
      // Respond with success
      res.status(200).json({ 
        success: true, 
        message: "Location data received successfully",
        data: latestLocationData
      });
    } catch (error) {
      console.error("Error processing location data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process location data",
        error: (error as Error).message 
      });
    }
  });
  
  // Add endpoint for IoT device location data (GET)
  app.get("/api/latest-location", (_req, res) => {
    if (!latestLocationData) {
      // If no real data, return mock data
      const mockData = {
        lat: 20.5937 + (Math.random() - 0.5) * 2, // Random location near the map center
        lon: 78.9629 + (Math.random() - 0.5) * 2,
        speed: Math.random() * 60, // 0-60 km/h
        satellites: Math.floor(Math.random() * 12) + 3, // 3-15 satellites
        altitude: Math.random() * 1000, // 0-1000 meters
        timestamp: new Date().toISOString()
      };
      
      return res.json(mockData);
    }
    
    // Transform the data to match the format expected by the frontend
    const transformedData = {
      lat: parseFloat(latestLocationData.lat),
      lon: parseFloat(latestLocationData.lon),
      speed: latestLocationData.speed_kmph ? parseFloat(latestLocationData.speed_kmph) : 0,
      satellites: latestLocationData.sats ? parseInt(latestLocationData.sats) : 0,
      altitude: latestLocationData.alt ? parseFloat(latestLocationData.alt) : 0,
      timestamp: latestLocationData.timestamp || new Date().toISOString()
    };
    
    res.json(transformedData);
  });

  return app;
}