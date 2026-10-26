# Backend REST API Specification

## 1. Global Conventions

- **Base Gateway URL:** `http://localhost:8080`
- **Data Exchange Format:** `application/json`
- **Timestamp Standard:** ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ss.SSSZ`)
- **Pagination Standard:** Zero-indexed query parameters (`page=0&size=20`)

### Uniform Response Envelope
```json
{
  "status": "SUCCESS",
  "message": "Operation completed successfully.",
  "data": { ... },
  "timestamp": "2026-10-26T20:00:00.000Z"
}
```

### Uniform Error Envelope
```json
{
  "status": "ERROR",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "The requested entity could not be found.",
  "errors": [
    {
      "field": "postId",
      "rejectedValue": "671cb0a84d4123456789abcd",
      "reason": "Post not found"
    }
  ],
  "timestamp": "2026-10-26T20:00:00.000Z"
}
```

---

## 2. Authentication & Identity (`/v1/auth`)

### 2.1 Register User
- **Route:** `POST /v1/auth/register`
- **Service:** `api-gateway` / Auth Provider
- **Request Body:**
```json
{
  "username": "hunain",
  "email": "hunain@example.com",
  "password": "Password123!",
  "fullName": "Syed Muhammad Hunain",
  "authProvider": "LOCAL"
}
```
*Note: `authProvider` supports `LOCAL`, `GOOGLE`, `APPLE` (PDF Section 1.c.i extensibility).*

- **Response (201 Created):**
```json
{
  "status": "SUCCESS",
  "message": "User registered successfully.",
  "data": {
    "userId": "671cb0a84d41234567891001",
    "username": "hunain",
    "email": "hunain@example.com",
    "fullName": "Syed Muhammad Hunain",
    "authProvider": "LOCAL",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-10-26T20:00:00.000Z"
}
```

### 2.2 Login User
- **Route:** `POST /v1/auth/login`
- **Request Body:**
```json
{
  "email": "hunain@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Login successful.",
  "data": {
    "userId": "671cb0a84d41234567891001",
    "username": "hunain",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-10-26T20:00:00.000Z"
}
```

---

## 3. Media Ingestion (`/v1/media`)

### 3.1 Generate Pre-Signed SAS URL
- **Route:** `POST /v1/media/presign`
- **Service:** `presigned-url-service` (Port 8082)
- **Request Body:**
```json
{
  "userId": "671cb0a84d41234567891001",
  "fileName": "demo-photo.jpg",
  "contentType": "image/jpeg"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Presigned SAS URL generated successfully.",
  "data": {
    "uploadUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg?sp=w&st=2026-10-26T20:00:00Z&se=2026-10-26T20:15:00Z&spr=https&sv=2026-09-01&sr=b&sig=abc123xyz...",
    "publicBlobUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg",
    "expiresAt": "2026-10-26T20:15:00Z"
  },
  "timestamp": "2026-10-26T20:00:00.000Z"
}
```

---

## 4. Posts Management (`/v1/posts`)

### 4.1 Create Post
- **Route:** `POST /v1/posts`
- **Service:** `post-writer-service` (Port 8081)
- **Request Body:**
```json
{
  "userId": "671cb0a84d41234567891001",
  "text": "Exploring distributed microservices on Azure and MongoDB Atlas!",
  "mediaUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg",
  "mediaType": "IMAGE",
  "hashtags": ["Java21", "SpringBoot", "Cloud"]
}
```
- **Response (201 Created):**
```json
{
  "status": "SUCCESS",
  "message": "Post created successfully.",
  "data": {
    "postId": "671cb0a84d41234567892001",
    "userId": "671cb0a84d41234567891001",
    "text": "Exploring distributed microservices on Azure and MongoDB Atlas!",
    "mediaUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg",
    "mediaType": "IMAGE",
    "hashtags": ["Java21", "SpringBoot", "Cloud"],
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2026-10-26T20:00:05.000Z",
    "updatedAt": "2026-10-26T20:00:05.000Z"
  },
  "timestamp": "2026-10-26T20:00:05.000Z"
}
```

### 4.2 Get Post by ID
- **Route:** `GET /v1/posts/{postId}`
- **Response (200 OK):** Returns single Post document.

### 4.3 Update Post
- **Route:** `PUT /v1/posts/{postId}`
- **Request Body:**
```json
{
  "userId": "671cb0a84d41234567891001",
  "text": "Updated content with refinements."
}
```

### 4.4 Soft Delete Post
- **Route:** `DELETE /v1/posts/{postId}?userId={userId}`
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Post deleted successfully.",
  "data": { "postId": "671cb0a84d41234567892001", "deleted": true },
  "timestamp": "2026-10-26T20:00:10.000Z"
}
```

---

## 5. Likes Management (`/v1/like` & `/v1/unlike`)

### 5.1 Like a Post
- **Route:** `POST /v1/like`
- **Service:** `like-unlike-service` (Port 8083)
- **Request Body:**
```json
{
  "userId": "671cb0a84d41234567891001",
  "postId": "671cb0a84d41234567892001"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Post liked.",
  "data": {
    "postId": "671cb0a84d41234567892001",
    "liked": true,
    "totalLikes": 1
  },
  "timestamp": "2026-10-26T20:00:12.000Z"
}
```

### 5.2 Unlike a Post
- **Route:** `POST /v1/unlike`
- **Request Body:** Same as Like.
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Post unliked.",
  "data": {
    "postId": "671cb0a84d41234567892001",
    "liked": false,
    "totalLikes": 0
  },
  "timestamp": "2026-10-26T20:00:14.000Z"
}
```

---

## 6. Comments Management (`/v1/comment`)

### 6.1 Create Comment
- **Route:** `POST /v1/comment`
- **Service:** `comment-service` (Port 8085)
- **Request Body:**
```json
{
  "userId": "671cb0a84d41234567891001",
  "postId": "671cb0a84d41234567892001",
  "content": "Super clear architecture diagram!"
}
```
- **Response (201 Created):**
```json
{
  "status": "SUCCESS",
  "message": "Comment posted successfully.",
  "data": {
    "commentId": "671cb0a84d41234567893001",
    "postId": "671cb0a84d41234567892001",
    "userId": "671cb0a84d41234567891001",
    "content": "Super clear architecture diagram!",
    "createdAt": "2026-10-26T20:00:15.000Z"
  },
  "timestamp": "2026-10-26T20:00:15.000Z"
}
```

### 6.2 Get Comments for Post
- **Route:** `GET /v1/comment/{postId}?page=0&size=20`

---

## 7. Social Graph (`/v1/follow` & `/v1/unfollow`)

### 7.1 Follow User
- **Route:** `POST /v1/follow`
- **Service:** `follow-service` (Port 8084)
- **Request Body:**
```json
{
  "followerId": "671cb0a84d41234567891001",
  "followingId": "671cb0a84d41234567891002"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "User followed successfully.",
  "data": {
    "followerId": "671cb0a84d41234567891001",
    "followingId": "671cb0a84d41234567891002",
    "isFollowing": true
  },
  "timestamp": "2026-10-26T20:00:18.000Z"
}
```

### 7.2 Unfollow User
- **Route:** `POST /v1/unfollow`
- **Request Body:** Same as Follow.

### 7.3 List Followers / Following
- **Route:** `GET /v1/follow/{userId}/followers`
- **Route:** `GET /v1/follow/{userId}/following`

---

## 8. Newsfeed Service (`/v1/feeds`)

### 8.1 Read Newsfeed
- **Route:** `GET /v1/feeds/{userId}?page=0&size=20`
- **Service:** `newsfeed-reader-service` (Port 8087)
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Feed fetched successfully.",
  "data": {
    "userId": "671cb0a84d41234567891001",
    "page": 0,
    "size": 20,
    "posts": [
      {
        "postId": "671cb0a84d41234567892001",
        "authorId": "671cb0a84d41234567891002",
        "authorName": "Jane Doe",
        "text": "Exploring distributed microservices on Azure and MongoDB Atlas!",
        "mediaUrl": "https://socialmediahunain.blob.core.windows.net/media-assets/demo-photo.jpg",
        "mediaType": "IMAGE",
        "hashtags": ["Java21", "SpringBoot", "Cloud"],
        "likeCount": 14,
        "commentCount": 3,
        "createdAt": "2026-10-26T20:00:05.000Z"
      }
    ]
  },
  "timestamp": "2026-10-26T20:00:20.000Z"
}
```
