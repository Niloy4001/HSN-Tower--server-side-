# HSN Tower (Building Management Website)

### Server-Side Repository  

**HSN Tower** is a full-stack web application designed to manage a single building efficiently. Users interested in renting apartments can view detailed apartment information and request membership in the building. Admins have the authority to accept or reject membership requests. Members can pay monthly rent through the platform and stay updated with announcements posted by the admin.  

---

## Live Site URL  
[Visit HSN Tower](https://hsn-tower-40.netlify.app/)  

---

## Key Features  

- **Role-Based Application:**  
  - Supports three roles: Admin, Member, and User.  
  - Admins cannot access Members' APIs or routes.  
  - Members cannot access Admin APIs or routes.  
  - Users cannot access APIs or routes meant for Admins or Members.  

- **Secure Payment System:**  
  - Integrated with Stripe for secure online transactions.  
  - Members can use coupons to avail discounts during payment.  

- **JWT Token Security:**  
  - A JWT token is generated and stored in the user's browser upon login or sign-up.  
  - The token is removed upon logout to maintain security.  
  - Access to private routes or APIs requires a valid JWT token. Unauthorized attempts result in automatic logout.  

- **Access Control:**  
  - Users cannot access other users' data, even with a valid JWT token.  
  - Each user receives an individual token stored locally.  
  - Attempts to access unauthorized data lead to automatic logout.  

- **Firebase Authentication:**  
  - Firebase is used for user authentication.  
  - API authorization is handled securely through JWT.  

- **Filtering Functionality:**  
  - Users can filter apartment data by specifying minimum and maximum price ranges.  

---

## NPM Packages Used in This Project  

- **Middleware and Utilities:**  
  - `cookie-parser`: `^1.4.7`  
  - `cors`: `^2.8.5`  
  - `dotenv`: `^16.4.7`  

- **Server Framework and Routing:**  
  - `express`: `^4.21.2`  

- **Authentication and Security:**  
  - `jsonwebtoken`: `^9.0.2`  

- **Database:**  
  - `mongodb`: `^6.12.0`  

- **Payment Integration:**  
  - `stripe`: `^17.5.0`  
