// Firebase configuration and initialization

// ========================================
// DATABASE 1: Orders Database
// ========================================
// Used for: Order management, admin panel
const ordersConfig = {
  apiKey: "AIzaSyBpG89fXOsMdByDUxEuTn8TiG9BQGCyz1o",
  authDomain: "europolyorders.firebaseapp.com",
  databaseURL: "https://europolyorders-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "europolyorders",
  storageBucket: "europolyorders.firebasestorage.app",
  messagingSenderId: "460493264565",
  appId: "1:460493264565:web:9ccc47eec74eea8a0250fc"
};

// ========================================
// DATABASE 2: Blogs & Reviews Database
// ========================================
// Used for: Blog posts, customer reviews
const blogsConfig = {
  apiKey: "AIzaSyCpfXipZVHKv1xomJkKn6BNa3tk3O65Wqs",
  authDomain: "europolys.firebaseapp.com",
  databaseURL: "https://europolys-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "europolys",
  storageBucket: "europolys.firebasestorage.app",
  messagingSenderId: "342054630441",
  appId: "1:342054630441:web:00db398888eb60a45b5838",
  measurementId: "G-S3PDG0GRNG"
};

// ========================================
// Initialize Firebase Apps
// ========================================

// Initialize primary app (orders)
const ordersApp = firebase.initializeApp(ordersConfig);
const ordersDatabase = firebase.database(ordersApp);

// Initialize secondary app (blogs/reviews)
const blogsApp = firebase.initializeApp(blogsConfig, 'blogsApp');
const blogsDatabase = firebase.database(blogsApp);

// ========================================
// Global Database References
// ========================================

// Orders database (backward compatible)
window.firebaseDB = ordersDatabase;
window.firebaseOrdersDB = ordersDatabase;

// Blogs/Reviews database
window.firebaseBlogsDB = blogsDatabase;

console.log('Firebase initialized successfully');
console.log('- Orders database: ready');
console.log('- Blogs/Reviews database: ready');
