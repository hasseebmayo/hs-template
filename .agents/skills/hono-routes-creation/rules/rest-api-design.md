# rest-ap-design: REST API Design Guidelines



## Overview

Design REST APIs that are intuitive, consistent, and follow industry best practices for resource-oriented architecture.

## When to Use

- Designing new RESTful APIs
- Creating endpoint structures
- Defining request/response formats
- Implementing API versioning
- Documenting API specifications
- Refactoring existing APIs

## Instructions

### 1. **Resource Naming**

```
✅ Good Resource Names (Nouns, Plural)
GET    /api/users
GET    /api/users/123
GET    /api/users/123/orders
POST   /api/products
DELETE /api/products/456

❌ Bad Resource Names (Verbs, Inconsistent)
GET    /api/getUsers
POST   /api/createProduct
GET    /api/user/123  (inconsistent singular/plural)
```

### 2. **HTTP Methods & Operations**

```http
# CRUD Operations
GET    /api/users          # List all users (Read collection)
GET    /api/users/123      # Get specific user (Read single)
POST   /api/users          # Create new user (Create)
PUT    /api/users/123      # Replace user completely (Update)
PATCH  /api/users/123      # Partial update user (Partial update)
DELETE /api/users/123      # Delete user (Delete)

# Nested Resources
GET    /api/users/123/orders       # Get user's orders
POST   /api/users/123/orders       # Create order for user
GET    /api/users/123/orders/456   # Get specific order
```

### 3. **Request Examples**

#### Creating a Resource
```http
POST /api/users
Content-Type: application/json

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"
}

Response: 201 Created
Location: /api/users/789
{
  "id": "789",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Updating a Resource
```http
PATCH /api/users/789
Content-Type: application/json

{
  "firstName": "Jonathan"
}

Response: 200 OK
{
  "id": "789",
  "email": "john@example.com",
  "firstName": "Jonathan",
  "lastName": "Doe",
  "role": "admin",
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

### 4. **Query Parameters**

```http
# Filtering
GET /api/products?category=electronics&inStock=true

# Sorting
GET /api/users?sort=lastName,asc

# Pagination
GET /api/users?page=2&limit=20

# Field Selection
GET /api/users?fields=id,email,firstName

# Search
GET /api/products?q=laptop

# Multiple filters combined
GET /api/orders?status=pending&customer=123&sort=createdAt,desc&limit=50
```

### 5. **Response Formats**

#### Success Response
```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "1.0"
  },
  "message": "User retrieved successfully"
}
```

#### Collection Response with Pagination
```json
{
  "data": [
    { "id": "1", "name": "Product 1" },
    { "id": "2", "name": "Product 2" }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  },
  "links": {
    "self": "/api/products?page=2&limit=20",
    "first": "/api/products?page=1&limit=20",
    "prev": "/api/products?page=1&limit=20",
    "next": "/api/products?page=3&limit=20",
    "last": "/api/products?page=8&limit=20"
  },
    "message": "Products retrieved successfully",
    "meta":{
        "timestamp":"2025-01-15T10:30:00Z",
        "version":"1.0"
    }
}
```
#### Error Response
```json
// this is the zod schema if errors are being thrown from validation it will this structure which will be managed by createApiRoute request


{
  "error": {
    "code":"UNAUTHORIZED", // and other things as well
    "message": "",

  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```


### 6. **HTTP Status Codes**

```
Success:
200 OK              - Successful GET, PATCH, DELETE
201 Created         - Successful POST (resource created)
204 No Content      - Successful DELETE (no response body)

Client Errors:
400 Bad Request     - Invalid request format/data
401 Unauthorized    - Missing or invalid authentication
403 Forbidden       - Authenticated but not authorized
404 Not Found       - Resource doesn't exist
409 Conflict        - Resource conflict (e.g., duplicate email)
422 Unprocessable   - Validation errors
429 Too Many Requests - Rate limit exceeded

Server Errors:
500 Internal Server Error - Generic server error
503 Service Unavailable   - Temporary unavailability
```

### 7. **API Versioning**

```http
# URL Path Versioning (Recommended)
GET /api/v1/users
GET /api/v2/users

# Header Versioning
GET /api/users
Accept: application/vnd.myapi.v1+json

# Query Parameter (Not recommended)
GET /api/users?version=1
```



## Best Practices

### ✅ DO
- Use nouns for resources, not verbs
- Use plural names for collections
- Be consistent with naming conventions
- Return appropriate HTTP status codes
- Include pagination for collections
- Provide filtering and sorting options
- Version your API
- Document thoroughly with OpenAPI
- Use HTTPS
- Implement rate limiting
- Provide clear error messages
- Use ISO 8601 for dates

### ❌ DON'T
- Use verbs in endpoint names
- Return 200 for errors
- Expose internal IDs unnecessarily
- Over-nest resources (max 2 levels)
- Use inconsistent naming
- Forget authentication
- Return sensitive data
- Break backward compatibility without versioning
