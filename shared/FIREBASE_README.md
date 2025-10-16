# Firebase Configuration

This project includes Firebase integration. To use Firebase services, you need to configure your environment variables.

## Setup Instructions

1. Create a `.env` file in the root of your project
2. Add your Firebase configuration values to the `.env` file:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Usage

Import the Firebase services in your components:

```javascript
import { auth, db, storage } from '@shared/firebase';

// Example: Using Firestore
import { collection, addDoc } from 'firebase/firestore';

const addData = async () => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "John",
      last: "Doe",
      born: 1990
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
```

## Services Available

- `auth` - Firebase Authentication
- `db` - Firestore Database
- `storage` - Firebase Storage

## Environment Variables

All environment variables are prefixed with `VITE_` to make them available to the client-side code in Vite projects.