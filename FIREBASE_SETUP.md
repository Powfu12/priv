# Firebase Dual Database Setup

This project uses **two separate Firebase databases** for different purposes.

## Database Overview

### 1. Orders Database (europolyorders)
**Purpose:** Order management and admin panel
**Database URL:** `https://europolyorders-default-rtdb.europe-west1.firebasedatabase.app`

**Used by:**
- Order forms (order-10m.html, order-20m.html, order-50m.html)
- Admin panel (admin.html)
- Order submission (order-script.js)

**Data stored:**
- Customer orders
- Order codes
- Personal information
- Shipping details
- Payment information
- Order status

### 2. Blogs & Reviews Database (europolys)
**Purpose:** Blog posts and customer reviews
**Database URL:** `https://europolys-default-rtdb.europe-west1.firebasedatabase.app`

**Will be used for:**
- Blog posts
- Customer reviews and ratings
- Testimonials

## Global Database References

After `firebase-config.js` is loaded, the following global variables are available:

```javascript
// Orders Database
window.firebaseDB          // Alias for orders database (backward compatible)
window.firebaseOrdersDB    // Orders database reference

// Blogs/Reviews Database
window.firebaseBlogsDB     // Blogs and reviews database reference
```

## Usage Examples

### Saving an Order (Already Implemented)
```javascript
const ordersRef = window.firebaseOrdersDB.ref('orders');
const newOrderRef = ordersRef.push();
newOrderRef.set(orderData);
```

### Saving a Blog Post (Future Implementation)
```javascript
const blogsRef = window.firebaseBlogsDB.ref('blogs');
const newBlogRef = blogsRef.push();
newBlogRef.set({
  title: 'Blog Post Title',
  content: 'Blog post content...',
  author: 'Admin',
  timestamp: new Date().toISOString(),
  published: true
});
```

### Saving a Customer Review (Future Implementation)
```javascript
const reviewsRef = window.firebaseBlogsDB.ref('reviews');
const newReviewRef = reviewsRef.push();
newReviewRef.set({
  orderCode: 'PRIME-XXXX-XXXX-XXXX',
  customerName: 'John Doe',
  rating: 5,
  comment: 'Great service!',
  timestamp: new Date().toISOString(),
  approved: false  // Admin must approve
});
```

### Reading Reviews (Future Implementation)
```javascript
const reviewsRef = window.firebaseBlogsDB.ref('reviews');
reviewsRef.orderByChild('approved').equalTo(true).on('value', (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const review = childSnapshot.val();
    console.log(review);
  });
});
```

## Database Structure

### Orders Database Structure
```
orders/
  ├── {orderId1}/
  │   ├── orderCode: "PRIME-XXXX-XXXX-XXXX"
  │   ├── timestamp: "2024-01-20T10:30:00Z"
  │   ├── status: "pending"
  │   ├── personalInfo/
  │   ├── package/
  │   ├── shipping/
  │   └── payment/
  └── {orderId2}/
      └── ...
```

### Blogs Database Structure (Suggested)
```
blogs/
  ├── {blogId1}/
  │   ├── title: "Blog Post Title"
  │   ├── content: "Full blog post content..."
  │   ├── author: "Admin Name"
  │   ├── timestamp: "2024-01-20T10:30:00Z"
  │   ├── published: true
  │   └── category: "news"
  └── {blogId2}/
      └── ...

reviews/
  ├── {reviewId1}/
  │   ├── orderCode: "PRIME-XXXX-XXXX-XXXX"
  │   ├── customerName: "John Doe"
  │   ├── rating: 5
  │   ├── comment: "Excellent service!"
  │   ├── timestamp: "2024-01-20T12:00:00Z"
  │   └── approved: true
  └── {reviewId2}/
      └── ...
```

## Firebase Security Rules

### Orders Database Rules
```json
{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Blogs/Reviews Database Rules
```json
{
  "rules": {
    "blogs": {
      ".read": true,
      ".write": "auth != null"
    },
    "reviews": {
      ".read": true,
      ".write": true,
      "$reviewId": {
        ".validate": "newData.hasChildren(['customerName', 'rating', 'comment', 'timestamp'])"
      }
    }
  }
}
```

## Next Steps

To implement blogs and reviews:

1. **Create Blog Page**
   - Create `blog.html` to display blog posts
   - Fetch posts from `window.firebaseBlogsDB.ref('blogs')`

2. **Add Blog Management to Admin Panel**
   - Add blog CRUD functionality in admin panel
   - Use `window.firebaseBlogsDB` to create/edit/delete posts

3. **Create Review Submission Form**
   - Add review form (can be on order confirmation or separate page)
   - Save reviews to `window.firebaseBlogsDB.ref('reviews')`

4. **Make Reviews Dynamic**
   - Replace static review counts in order pages
   - Calculate average rating from Firebase reviews
   - Display real review count

5. **Add Review Management**
   - Add review approval system in admin panel
   - Allow admins to approve/reject reviews
   - Display approved reviews on website

## Current Status

- ✅ Orders database: **Fully implemented**
- ✅ Blogs/Reviews database: **Configured and ready**
- ⏳ Blog system: **Not implemented yet**
- ⏳ Review system: **Not implemented yet** (currently showing static "4.9/5 from 2,847 reviews")

## Testing

You can test the databases using the Firebase Console:

1. **Orders Database:** https://console.firebase.google.com/project/europolyorders/database
2. **Blogs/Reviews Database:** https://console.firebase.google.com/project/europolys/database

## Support

For questions about Firebase setup, check:
- Firebase Documentation: https://firebase.google.com/docs/database
- Firebase Console: https://console.firebase.google.com/
