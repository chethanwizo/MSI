# API Documentation

Complete API reference for the MIS Analytics Platform.

## 🔐 Authentication

All API endpoints (except login/register) require JWT authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🔑 Auth Endpoints

### POST /api/auth/login
Login user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### POST /api/auth/register
Register new user (Admin only).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "viewer"
}
```

### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

## 📤 Upload Endpoints

### POST /api/upload/mis
Upload MIS Excel file (Admin only).

**Request:** `multipart/form-data`
- `misFile`: Excel file (.xlsx or .xls)

**Response:**
```json
{
  "message": "MIS file processed successfully",
  "processedCount": 150,
  "errorCount": 2,
  "errors": [
    "Row 45: Missing required data",
    "Row 67: Invalid ARN format"
  ]
}
```

### POST /api/upload/dump
Upload Bank Dump Excel file (Admin only).

**Request:** `multipart/form-data`
- `dumpFile`: Excel file (.xlsx or .xls)

**Response:**
```json
{
  "message": "Bank dump file processed successfully",
  "processedCount": 200,
  "mappedCount": 180,
  "unmappedCount": 20,
  "errors": []
}
```

### GET /api/upload/history
Get upload history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "fileType": "MIS",
      "recordCount": 150,
      "fileName": "mis_data_2024_01_15.xlsx",
      "uploadedBy": "admin@example.com",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "status": "success",
      "errorLog": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

## 📊 Dashboard Endpoints

### GET /api/dashboard/metrics
Get dashboard metrics with optional filters.

**Query Parameters:**
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)
- `employeeId` (optional): Filter by employee ID

**Response:**
```json
{
  "totalApplications": 1500,
  "approvedApplications": 900,
  "rejectedApplications": 400,
  "pendingApplications": 200,
  "approvalRate": 60.0,
  "totalEmployees": 25,
  "mappedDumpRecords": 1200,
  "unmappedDumpRecords": 50
}
```

### GET /api/dashboard/employee-performance
Get employee performance data.

**Query Parameters:**
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `limit` (optional): Number of employees (default: 10)

**Response:**
```json
[
  {
    "employeeId": 1,
    "employeeName": "John Smith",
    "totalApplications": 120,
    "approvedApplications": 80,
    "rejectedApplications": 30,
    "pendingApplications": 10,
    "conversionRate": 66.67
  }
]
```

### GET /api/dashboard/rejection-analysis
Get rejection reasons and categories analysis.

**Response:**
```json
{
  "rejectionReasons": [
    {
      "reason": "Insufficient Income",
      "count": 45
    },
    {
      "reason": "Poor Credit Score",
      "count": 32
    }
  ],
  "rejectionCategories": [
    {
      "category": "Financial",
      "count": 78
    },
    {
      "category": "Documentation",
      "count": 23
    }
  ]
}
```

### GET /api/dashboard/trends
Get date-wise application trends.

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "total_applications": 25,
    "approved": 15,
    "rejected": 8
  }
]
```

### GET /api/dashboard/kyc-funnel
Get VKYC/BKYC completion funnel data.

**Response:**
```json
{
  "totalRecords": 1000,
  "vkycCompleted": 850,
  "bkycCompleted": 780,
  "vkycCompletionRate": "85.00",
  "bkycCompletionRate": "78.00"
}
```

## 🔍 Search Endpoints

### GET /api/search
Advanced search across all application data.

**Query Parameters:**
- `query` (optional): General search term
- `employeeName` (optional): Employee name filter
- `arn` (optional): ARN filter
- `customerName` (optional): Customer name filter
- `mobileNo` (optional): Mobile number filter
- `status` (optional): Status filter (approved/rejected/pending)
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "arn": "ARN123456789",
      "customerName": "Jane Doe",
      "mobileNo": "9876543210",
      "applicationDate": "2024-01-15T00:00:00Z",
      "employee": {
        "id": 1,
        "name": "John Smith"
      },
      "status": {
        "approved": true,
        "bankStatus": "APPROVED",
        "declineDescription": null,
        "declineCategory": null,
        "activationStatus": "ACTIVE",
        "decisionDate": "2024-01-20T00:00:00Z"
      },
      "misData": {
        "DATE": "2024-01-15",
        "ARN NO": "ARN123456789",
        "CUSTOMER NAME": "Jane Doe",
        "MOBILE NO": "9876543210",
        "EMP NAME": "John Smith",
        "VKYC STATUS": "COMPLETED",
        "BKYC STATUS": "COMPLETED",
        "DECLINE CODE": "",
        "FINAL": "APPROVED"
      },
      "dumpData": {
        "APPL_REF": "ARN123456789",
        "FULL_NAME": "Jane Doe",
        "CITY": "Mumbai",
        "PRODUCT": "Credit Card",
        "DECLINE_DESCRIPTION": "",
        "Activation Status": "ACTIVE"
      },
      "lastUpdated": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### GET /api/search/unmapped
Get unmapped dump records.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "applRef": "UNKNOWN_ARN_123",
      "rawJson": {
        "APPL_REF": "UNKNOWN_ARN_123",
        "FULL_NAME": "Unknown Customer",
        "CITY": "Delhi"
      },
      "uploadDate": "2024-01-15T10:30:00Z",
      "isMapped": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### POST /api/search/export
Export search results to Excel format.

**Request:**
```json
{
  "query": "john",
  "status": "approved",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

**Response:**
```json
{
  "data": [
    {
      "ARN": "ARN123456789",
      "Customer Name": "Jane Doe",
      "Mobile No": "9876543210",
      "Employee Name": "John Smith",
      "Application Date": "2024-01-15T00:00:00Z",
      "Approved": "Yes",
      "Bank Status": "APPROVED",
      "Decline Description": "",
      "Decline Category": "",
      "Activation Status": "ACTIVE",
      "Decision Date": "2024-01-20T00:00:00Z",
      "VKYC Status": "COMPLETED",
      "BKYC Status": "COMPLETED",
      "City": "Mumbai",
      "Product": "Credit Card"
    }
  ],
  "count": 150,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 👥 Employee Endpoints

### GET /api/employee
Get all employees with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)

**Response:**
```json
{
  "employees": [
    {
      "id": 1,
      "name": "John Smith",
      "createdAt": "2024-01-01T00:00:00Z",
      "_count": {
        "applications": 120
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

### GET /api/employee/:id
Get employee details with applications.

**Query Parameters:**
- `page` (optional): Page number for applications (default: 1)
- `limit` (optional): Applications per page (default: 20)
- `dateFrom` (optional): Filter applications from date
- `dateTo` (optional): Filter applications to date

**Response:**
```json
{
  "employee": {
    "id": 1,
    "name": "John Smith",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "totalApplications": 120,
    "approvedApplications": 80,
    "rejectedApplications": 30,
    "pendingApplications": 10,
    "conversionRate": "66.67"
  },
  "applications": [
    {
      "id": 1,
      "arn": "ARN123456789",
      "customerName": "Jane Doe",
      "mobileNo": "9876543210",
      "applicationDate": "2024-01-15T00:00:00Z",
      "applicationStatus": {
        "approved": true,
        "bankStatus": "APPROVED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "pages": 6
  }
}
```

### GET /api/employee/performance/comparison
Get employee performance comparison.

**Query Parameters:**
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `limit` (optional): Number of employees (default: 20)

**Response:**
```json
[
  {
    "employeeId": 1,
    "employeeName": "John Smith",
    "totalApplications": 120,
    "approvedApplications": 80,
    "rejectedApplications": 30,
    "pendingApplications": 10,
    "conversionRate": 66.67,
    "avgProcessingDays": 5.2
  }
]
```

### GET /api/employee/performance/top
Get top performing employees.

**Query Parameters:**
- `metric` (optional): Sort metric (conversion/volume/approved, default: conversion)
- `limit` (optional): Number of employees (default: 10)
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response:**
```json
[
  {
    "employeeId": 1,
    "employeeName": "John Smith",
    "totalApplications": 120,
    "approvedApplications": 80,
    "conversionRate": 66.67
  }
]
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

## 🔄 Rate Limiting

- **Rate Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## 📝 Notes

1. **Date Format:** All dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
2. **File Size:** Maximum file size is 10MB for uploads
3. **Pagination:** Default page size is 20, maximum is 100
4. **Search:** Search is case-insensitive and supports partial matches
5. **Raw Data:** All raw Excel data is preserved in JSONB format

---

**API Version:** 1.0.0  
**Last Updated:** January 2024