import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyAxmnZm4597RcMVQeJrby3HpuDfzYyTJoU',
  authDomain: 'ptprojectsweb.firebaseapp.com',
  databaseURL: 'https://ptprojectsweb-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'ptprojectsweb',
  storageBucket: 'ptprojectsweb.firebasestorage.app',
  messagingSenderId: '93484780890',
  appId: '1:93484780890:web:cbbc8204b016f9819ff763',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
