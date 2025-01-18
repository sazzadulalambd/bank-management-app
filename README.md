# Bank Management Application

## Overview

The Bank Management Application simulates core banking functionalities by providing a centralized system for account management, transactions, and reporting. The backend API serves as the core of the system, enabling seamless interaction for various user roles, including customers, bank staff, and admins.

## Key Features 

### **Features Overview**

1. **User Authentication and Authorization**
   - **User Registration**:  
   - New users can register with a username, password, email, and role.  
   - Validates inputs and prevents duplicate usernames.  
   - Sends a welcome email after successful registration.
   - **User Login**:  
   - Authenticates users using username and password.  
   - Issues JWT access and refresh tokens for session management.  
   - Logs invalid login attempts for security.
   - **Token Verification**:  
   - Verifies JWT access tokens for validity.  
   - Ensures refresh tokens exist in the database.
   - **Password Reset**:  
   - Forgot password feature generates OTP sent via email.  
   - Users can verify OTP to securely reset their password.
   - **Logout**:  
   - Deletes refresh tokens from the database to end the user session.
2. **Account Management**
   - **Account Types**: Supports checking, savings, and loan accounts.  
   - **CRUD Operations**: Enables account creation, viewing, updating, and deletion.  
   - **Account Details**: Displays balances, transaction history, and user details.  
   - **Multi-Currency Support**: Optionally supports different currencies for balances.
3. **Transactions and Fund Transfers**
   - **Deposits and Withdrawals**:
   - Deposit money into their accounts.
   - Withdraw money from their accounts.  
   - **Fund Transfers**:  
   - Internal transfers between accounts.  
   - External transfers (requires approval for interbank transactions).  
   - **Transaction Limits and Fees**:  
   - Allows admins to set daily transaction limits and fees for different roles.  
   - **Transaction History**:  
   - Stores and retrieves transaction records with details like amount, type, and fees.
4. **Loan Management**
   - Loan Application: Enable customers to apply for loans (with fields for loan type, amount etc.).
   - Loan Approval Workflow: Admins or managers review and approve/reject loan applications.
   - Repayment Schedules: Calculate and display loan repayment schedules, including interest.
   - Penalty Calculation: Add functionality to handle penalties for overdue repayments.

5. **Interest Calculation and Savings Plans**
   - Interest Calculation Engine: Calculate monthly or yearly interest based on account types.
   - Savings Plans: Offer fixed deposit or recurring deposit plans with interest calculations.
   - Automated Interest Credit: Monthly crediting of interest to accounts with a scheduler.

6. **Reporting and Statements**
   - Monthly Statements: Generate monthly account statements with all transactions.
   - Detailed Reports: Include reports on account summaries, loan balances, and transaction history.

## Feature Table

| **Feature**                          | **Customer**                    | **Bank Staff**                         | **Admin**                              |
|--------------------------------------|----------------------------------|----------------------------------------|----------------------------------------|
| **User Authentication**              | JWT-based Login                 | JWT-based Login                        | JWT-based Login                        |
| **Account Management**               |                                  |                                        |                                        |
| - View Account Details               | ✅                               | ✅                                     | ✅                                     |
| - Create Accounts                    | ❌                               | ✅                                     | ✅                                     |
| - Update Accounts                    | ❌                               | ✅                                     | ✅                                     |
| - Delete Accounts                    | ❌                               | ✅                                     | ✅                                     |
| - Multi-Currency Support             | ✅ (for balance display)         | ✅                                     | ✅                                     |
| **Transactions and Fund Transfers**  |                                  |                                        |                                        |
| - Deposit Money                      | ✅                               | ✅                                     | ✅                                     |
| - Withdraw Money                     | ✅                               | ✅                                     | ✅                                     |
| - Transfer Money (Internal)          | ✅                               | ✅                                     | ✅                                     |
| - Transfer Money (External)          | ✅ (via approval)                | ✅ (approve/reject requests)           | ✅ (approve/reject requests)           |
| - Transaction History                | ✅                               | ✅                                     | ✅                                     |
| - Set Transaction Limits and Fees    | ❌                               | ❌                                     | ✅                                     |
| **Loan Management**                  |                                  |                                        |                                        |
| - Apply for Loan                     | ✅                               | ❌                                     | ❌                                     |
| - Approve/Reject Loan Applications   | ❌                               | ✅                                     | ✅                                     |
| - View Loan Details                  | ✅ (own loans)                   | ✅                                     | ✅                                     |
| - Penalty Handling                   | ❌                               | ✅                                     | ✅                                     |
| **Reports and Statements**           |                                  |                                        |                                        |
| - Monthly Account Statements         | ✅ (own accounts only)           | ✅                                     | ✅                                     |
| - Generate Detailed Reports          | ❌                               | ✅                                     | ✅                                     |


## Technical Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT-based authentication
- **Reporting**: Custom reporting tools

## ERD Diagram

### Entity-Relationship Diagram (ERD)

You can view the ERD diagram at the following link:
[View ERD Diagram](https://dbdiagram.io/d/Entity-Relationship-Diagram-ERD-for-Bank-Management-Application-6788ac626b7fa355c30d056d)

![ERD Diagram](ERD.png)

## Setup Instructions

1. Clone this repository.
2. Create a `.env` file in the root directory with your database credentials and JWT secret.
3. Run `docker-compose up --build -d` to start the application.
4. Access the API at:
   - **Base URL**: [http://localhost:9000/api/v1](http://localhost:9000/api/v1)

## **Bank Management Application - API Documentation**

The application provides comprehensive API endpoints for authentication, account management, transactions, and admin functionalities. Below is the categorized list of available routes.

---

### **Authentication Endpoints**

| **Method** | **Endpoint**            | **Description**                                    |
|------------|-------------------------|----------------------------------------------------|
| `POST`     | `/login`         | Authenticate a user and generate access and refresh tokens. |
| `POST`     | `/register`      | Register a new user (requires username, email, password, role). |
| `GET`      | `/verify-token`  | Verify the validity of the provided JWT access token. |
| `POST`     | `/forgot-password` | Generate an OTP for password reset and send it to the user's email. |
| `POST`     | `/verify-otp`    | Verify the provided OTP for password reset. |
| `POST`     | `/reset-password` | Reset the user's password (requires new password and OTP verification). |
| `POST`     | `/logout`        | Log out the user and invalidate their refresh token. |

---

### **Account Management Endpoints**

| **Method** | **Endpoint**            | **Access**       | **Description**                                    |
|------------|-------------------------|------------------|----------------------------------------------------|
| `POST`     | `/accounts`      | Staff, Admin     | Create a new account (requires userId and account type). |
| `GET`      | `/accounts`      | All Roles        | Retrieve all accounts associated with the user. |
| `GET`      | `/accounts/:id`  | All Roles        | Retrieve specific account details by ID. |
| `PUT`      | `/accounts/:id`  | Staff, Admin     | Update details of an existing account. |
| `DELETE`   | `/accounts/:id`  | Staff, Admin     | Delete an account by its ID. |

---

### **Transaction Endpoints**

| **Method** | **Endpoint**                              | **Access**            | **Description**                                    |
|------------|-------------------------------------------|-----------------------|----------------------------------------------------|
| `POST`     | `/transactions/deposit`            | All Roles             | Deposit money into an account. |
| `POST`     | `/transactions/withdraw`           | All Roles             | Withdraw money from an account. |
| `POST`     | `/transactions/transfer`           | All Roles             | Transfer money between user accounts. |
| `POST`     | `/transactions/request-external-transfer` | Customer              | Request approval for an external bank transfer. |
| `POST`     | `/transactions/approve-reject-transfer/:id` | Staff, Admin          | Approve or reject a pending external transfer request. |
| `GET`      | `/transactions/history/:id`        | All Roles             | Retrieve transaction history for a specific account by ID. |

---

### **Admin Endpoints**

| **Method** | **Endpoint**            | **Access** | **Description**                                    |
|------------|-------------------------|------------|----------------------------------------------------|
| `POST`     | `/admins/set-limits` | Admin      | Set daily transaction limits and fees for specific roles. |

---

### **How to Use**
1. **Base URL**:  
   All endpoints are prefixed with the following base URL: 
   [http://localhost:9000/api/v1](http://localhost:9000/api/v1) 
2. **Environment Variables**:  
   Ensure the `API_URL` is set as `/api/v1` in your environment variables or Postman collection.
3. **Authentication**:  
   - Most endpoints require a valid JWT token.  
   - Include the token in the `Authorization` header as:  
     ```
     Authorization: Bearer <your_jwt_token>
     ```

---

## **Testing**

### **Postman Collection**
The complete API collection for testing is available in the file:  
[`Bank Management Application.postman_collection.json`](https://github.com/sazzadulalambd/bank-management-app/blob/main/Bank%20Management%20Application.postman_collection.json).  

### **Steps to Import into Postman**
1. Open Postman.
2. Click the **Import** button.
3. Upload the JSON file (`Bank Management Application.postman_collection.json`).
4. Update the `base_url` environment variable to `http://localhost:9000/api/v1`.
5. Use the collection to test API endpoints.

### Notes
- Authentication is required for most endpoints. Include a valid JWT token in the Authorization header (e.g., Bearer <token>).
---

### Example Usage

#### **Register a User**

**Request**:  
`POST /register`  
**Payload**:

```json
{
  "username": "sazzadulalamshawon",
  "password": "Sazzad@123",
  "phoneNumber":"01772994093",
  "email": "sazzadulalamshawon@gmail.com",
  "role": "customer"
}
```

**Response**:

```json
{
  "message": "User registered successfully",
  "userId": 123
}
```


## **License**

This project is licensed under the **MIT License**. See the LICENSE file for details.