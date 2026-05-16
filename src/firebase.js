// =====================================================
// LANGKAH 1: Buat project di https://console.firebase.google.com
// LANGKAH 2: Buat Realtime Database (pilih "start in test mode")
// LANGKAH 3: Klik ikon roda gigi > Project Settings > Web App
// LANGKAH 4: Copy config di bawah ini dan paste ke sini
// =====================================================

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBC56NEMl_s7oP3KaX4XnMX6fHhnXsvHdU",
  authDomain: "gazebo-monitor.firebaseapp.com",
  projectId: "gazebo-monitor",
  storageBucket: "gazebo-monitor.firebasestorage.app",
  messagingSenderId: "1039885078642",
  appId: "1:1039885078642:web:98c5d7845b5a2f985072eb",
  measurementId: "G-7QXG8MG233"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
