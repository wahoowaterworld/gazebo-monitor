// =====================================================
// LANGKAH 1: Buat project di https://console.firebase.google.com
// LANGKAH 2: Buat Realtime Database (pilih "start in test mode")
// LANGKAH 3: Klik ikon roda gigi > Project Settings > Web App
// LANGKAH 4: Copy config di bawah ini dan paste ke sini
// =====================================================

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_LO",
  authDomain: "GANTI.firebaseapp.com",
  databaseURL: "https://GANTI-default-rtdb.firebaseio.com",
  projectId: "GANTI",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI",
  appId: "GANTI"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
