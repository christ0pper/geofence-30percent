/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Health check function
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Save a geofence
export const saveGeofence = onRequest(async (request, response) => {
  try {
    const geofenceData = request.body;
    logger.info("Saving geofence", { geofenceData });
    
    // Add timestamp
    const geofenceWithTimestamp = {
      ...geofenceData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    const docRef = await admin.firestore().collection('geofences').add(geofenceWithTimestamp);
    
    response.status(200).json({ 
      success: true, 
      id: docRef.id,
      message: "Geofence saved successfully!" 
    });
  } catch (error) {
    logger.error("Error saving geofence", { error });
    response.status(500).json({ 
      success: false, 
      message: "Failed to save geofence",
      error: (error as Error).message 
    });
  }
});

// Get all geofences
export const getGeofences = onRequest(async (request, response) => {
  try {
    logger.info("Fetching geofences");
    
    const snapshot = await admin.firestore().collection('geofences').orderBy('createdAt', 'desc').get();
    const geofences: any[] = [];
    
    snapshot.forEach((doc) => {
      geofences.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    response.status(200).json({ 
      success: true, 
      data: geofences 
    });
  } catch (error) {
    logger.error("Error fetching geofences", { error });
    response.status(500).json({ 
      success: false, 
      message: "Failed to fetch geofences",
      error: (error as Error).message 
    });
  }
});

// Delete a geofence
export const deleteGeofence = onRequest(async (request, response) => {
  try {
    const { id } = request.body;
    logger.info("Deleting geofence", { id });
    
    if (!id) {
      response.status(400).json({ 
        success: false, 
        message: "Geofence ID is required" 
      });
      return;
    }
    
    await admin.firestore().collection('geofences').doc(id).delete();
    
    response.status(200).json({ 
      success: true, 
      message: "Geofence deleted successfully!" 
    });
  } catch (error) {
    logger.error("Error deleting geofence", { error });
    response.status(500).json({ 
      success: false, 
      message: "Failed to delete geofence",
      error: (error as Error).message 
    });
  }
});