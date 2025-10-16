// Example component showing how to use Firebase with geofencing data
import { useState } from 'react';
import { db } from '@shared/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface GeofenceData {
  type: 'circle' | 'polygon';
  id: string;
  data: {
    center?: { lat: number; lng: number };
    radius?: number;
    vertices?: { lat: number; lng: number }[];
  };
  createdAt: Date;
}

const FirebaseGeofenceExample = () => {
  const [geofences, setGeofences] = useState<GeofenceData[]>([]);
  const [loading, setLoading] = useState(false);

  // Save geofence to Firebase
  const saveGeofence = async (geofence: Omit<GeofenceData, 'createdAt'>) => {
    try {
      const geofenceWithTimestamp = {
        ...geofence,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'geofences'), geofenceWithTimestamp);
      toast.success('Geofence saved successfully!');
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
      toast.error('Failed to save geofence');
    }
  };

  // Load geofences from Firebase
  const loadGeofences = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'geofences'));
      const fetchedGeofences: GeofenceData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedGeofences.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as GeofenceData);
      });
      
      setGeofences(fetchedGeofences);
      toast.success(`Loaded ${fetchedGeofences.length} geofences`);
    } catch (e) {
      console.error('Error getting documents: ', e);
      toast.error('Failed to load geofences');
    } finally {
      setLoading(false);
    }
  };

  // Delete a geofence from Firebase
  const deleteGeofence = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'geofences', id));
      setGeofences(geofences.filter(g => g.id !== id));
      toast.success('Geofence deleted successfully!');
    } catch (e) {
      console.error('Error deleting document: ', e);
      toast.error('Failed to delete geofence');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Firebase Geofence Example</h2>
      
      <div className="flex gap-2">
        <button 
          onClick={() => saveGeofence({
            type: 'circle',
            id: `geofence-${Date.now()}`,
            data: {
              center: { lat: 20.5937, lng: 78.9629 },
              radius: 1000
            }
          })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Sample Geofence
        </button>
        
        <button 
          onClick={loadGeofences}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Geofences'}
        </button>
      </div>

      {geofences.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Saved Geofences:</h3>
          <ul className="mt-2 space-y-2">
            {geofences.map((geofence) => (
              <li key={geofence.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <div>
                  <span className="font-medium">{geofence.type}</span> - {geofence.createdAt.toLocaleString()}
                </div>
                <button 
                  onClick={() => deleteGeofence(geofence.id)}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirebaseGeofenceExample;