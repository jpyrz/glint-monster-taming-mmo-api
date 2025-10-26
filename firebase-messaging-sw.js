// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

// ⚠️ SETUP REQUIRED: Update the firebaseConfig object below with your actual Firebase project credentials
// Get these from: Firebase Console → Project Settings → General → Your apps

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

// Firebase configuration - Replace with your project's config
// TODO: Update these values with your actual Firebase project credentials
// Get these from: Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCeXnv9MlZD2bD1S2dmiWujyG59Hb4_Ir4",
  authDomain: "glint-monster-tamer.firebaseapp.com",
  projectId: "glint-monster-tamer",
  storageBucket: "glint-monster-tamer.firebasestorage.app",
  messagingSenderId: "605558195039",
  appId: "1:605558195039:web:3e01dbca79c18d546aecea",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("🔥 [Service Worker] Received background message:", payload);

  // Log the full payload structure for debugging
  console.log(
    "📋 [Service Worker] Payload structure:",
    JSON.stringify(payload, null, 2)
  );

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Message";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new message",
    icon: payload.notification?.icon || "/icon-192x192.png",
    badge: payload.notification?.badge || "/badge-72x72.png",
    tag: payload.notification?.tag || "fcm-notification",
    requireInteraction: payload.notification?.requireInteraction || false,
    data: payload.data || {},
    actions: payload.notification?.actions || [
      {
        action: "open",
        title: "Open App",
        icon: "/icon-192x192.png",
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Handle different actions
  if (event.action === "open" || !event.action) {
    // Open the app when notification is clicked
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (
              client.url.includes(self.location.origin) &&
              "focus" in client
            ) {
              return client.focus();
            }
          }

          // If app is not open, open it
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
    );
  }
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("Firebase messaging service worker installed");
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("Firebase messaging service worker activated");
  event.waitUntil(self.clients.claim());
});
