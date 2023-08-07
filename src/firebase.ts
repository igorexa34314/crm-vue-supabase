// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
export const firebaseApp = initializeApp({
	apiKey: import.meta.env.VITE_FB_API_KEY,
	authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FB_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FB_APP_ID,
	measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
	databaseURL: import.meta.env.VITE_FB_DATABASE_URL
});

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(firebaseApp, {
	provider: new ReCaptchaV3Provider(import.meta.env.VITE_FB_RECAPTCHA_PUBLIC_KEY),
	isTokenAutoRefreshEnabled: true // Set to true to allow auto-refresh.
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(firebaseApp);

// Initialize Realtime Database and get a reference to the service
export const db = getFirestore(firebaseApp);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(firebaseApp);

const analytics = getAnalytics(firebaseApp);
