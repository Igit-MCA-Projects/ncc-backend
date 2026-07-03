# Authentication System Documentation

This document describes the full authentication flow in this backend: student registration, admin registration, email verification, login, logout, route payloads, success responses, and error responses.

## Base Path

All authentication routes are mounted under:

`/api/v{API_VERSION}/auth`

`API_VERSION` comes from the environment configuration.

## Common Request Format

All routes expect JSON request bodies unless stated otherwise.

Use this header for body-based requests:

```http
Content-Type: application/json
```

## Shared Response Envelope

The API uses a shared response shape through `ApiResponse`.

### Success Response Shape

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": null,
  "success": true
}
```

Fields:

| Field        | Type                | Meaning                                              |
| ------------ | ------------------- | ---------------------------------------------------- |
| `statusCode` | number              | HTTP status code returned by the API                 |
| `message`    | string              | Human readable message                               |
| `data`       | object or null      | Route-specific payload, if any                       |
| `success`    | boolean             | `true` when status code is below 400                 |
| `meta`       | object or undefined | Extra information, mainly used for validation errors |

### Error Response Shape

Errors are returned through the same envelope, but with `success: false` and `data: null`.

```json
{
  "statusCode": 400,
  "message": "Invalid data",
  "data": null,
  "success": false,
  "meta": {
    "errors": [
      {
        "field": "email",
        "message": "Please enter a valid email address",
        "code": "invalid_string"
      }
    ]
  }
}
```

When `NODE_ENV` is `DEV`, the error payload may also include a `stack` field inside `meta`.

## Authentication Routes

| Method | Route                 | Auth Required | Purpose                        |
| ------ | --------------------- | ------------- | ------------------------------ |
| `POST` | `/register`           | No            | Register a student account     |
| `POST` | `/verify-email`       | No            | Verify student email using OTP |
| `POST` | `/login`              | No            | Student login                  |
| `POST` | `/admin-register`     | No            | Register an admin account      |
| `POST` | `/admin-login`        | No            | Admin login                    |
| `POST` | `/admin-verify-email` | No            | Verify admin email using OTP   |
| `POST` | `/logout`             | Yes           | Clear the active auth cookie   |

## Student Registration

### Route

`POST /api/v{API_VERSION}/auth/register`

### Required Body

```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@example.com",
  "password": "password123"
}
```

### Validation Rules

| Field      | Type   | Rules                                   |
| ---------- | ------ | --------------------------------------- |
| `fullName` | string | Required, trimmed, minimum 1 character  |
| `email`    | string | Required, must be a valid email address |
| `password` | string | Required, minimum 8 characters          |

### What the API Does

1. Validates the request body with Zod.
2. Checks whether a student with the same email already exists.
3. Hashes the password with bcrypt.
4. Creates the student record.
5. Generates a 4-digit OTP.
6. Hashes the OTP and stores it in `verifyToken`.
7. Sends a verification email containing the OTP.
8. Returns a success response.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Account created successfully now verify the eamil",
  "data": null,
  "success": true
}
```

### Important Notes

- The OTP is generated as a 4-digit number.
- The OTP is stored in hashed form, not plain text.
- The controller does not expose the OTP in the HTTP response.
- The handler attempts to send email, but the current code does not fail the request if `sendMail` returns `false`.

### Possible Errors

| Status | Message                      | When it happens                                    |
| ------ | ---------------------------- | -------------------------------------------------- |
| `400`  | `Provided data are invalid`  | Request body fails validation                      |
| `400`  | `This email is alredy taken` | A student with the same email already exists       |
| `422`  | `Validation failed`          | If Zod validation reaches the global error handler |
| `400`  | `Invalid JSON payload`       | Malformed JSON body                                |

## Student Email Verification

### Route

`POST /api/v{API_VERSION}/auth/verify-email`

### Required Body

```json
{
  "otp": "1234",
  "email": "rahul@example.com"
}
```

### Validation Rules

| Field   | Type   | Rules                         |
| ------- | ------ | ----------------------------- |
| `otp`   | string | Exactly 4 characters          |
| `email` | string | Must be a valid email address |

### What the API Does

1. Validates the request body.
2. Finds the student by email.
3. Compares the supplied OTP with the hashed `verifyToken` stored in the database.
4. Marks the student as verified.
5. Clears `verifyToken`.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Email verifyed login",
  "data": null,
  "success": true
}
```

### Possible Errors

| Status | Message                       | When it happens                            |
| ------ | ----------------------------- | ------------------------------------------ |
| `400`  | `Invalid data`                | Request body fails validation              |
| `400`  | `Provided email is not found` | No student exists for the supplied email   |
| `400`  | `Invalid otp`                 | OTP does not match the stored hashed token |

### Important Notes

- The current code checks only the OTP and email.
- There is no explicit OTP expiry check in the controller code.
- Email verification is required in the business flow, but login does not currently enforce the verification flag in the shown code.

## Student Login

### Route

`POST /api/v{API_VERSION}/auth/login`

### Required Body

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

### Validation Rules

| Field      | Type   | Rules                          |
| ---------- | ------ | ------------------------------ |
| `email`    | string | Required, valid email address  |
| `password` | string | Required, minimum 8 characters |

### What the API Does

1. Validates the request body.
2. Looks up the student by email.
3. Compares the submitted password with the stored bcrypt hash.
4. Generates a JWT access token.
5. Stores the token in an HTTP-only cookie named `accesstoken`.

### Cookie Behavior

The login response sets this cookie:

| Cookie        | Value Format   | Options                                                                                      |
| ------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `accesstoken` | `Bearer <JWT>` | `httpOnly: true`, `path: /`, `maxAge: 30 days`, `sameSite` and `secure` depend on `NODE_ENV` |

Environment-based cookie rules:

- In `PROD`, `sameSite` is `none` and `secure` is `true`.
- In non-production environments, `sameSite` is `lax` and `secure` is `false`.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Login successfull",
  "data": null,
  "success": true
}
```

### Possible Errors

| Status | Message                                              | When it happens                          |
| ------ | ---------------------------------------------------- | ---------------------------------------- |
| `400`  | `Invalid data`                                       | Request body fails validation            |
| `400`  | `Email is not exist kindly register`                 | No student exists for the supplied email |
| `400`  | `The password is not mathch`                         | Password comparison fails                |
| `429`  | `Too many login attempts, try again after some time` | Rate limiter is triggered                |

### Rate Limiting

The student login route is protected by `loginLimiter`:

- Window: 10 minutes
- Limit: 200 requests

## Admin Registration

### Route

`POST /api/v{API_VERSION}/auth/admin-register`

### Required Body

```json
{
  "fullName": "Asha Verma",
  "email": "asha@example.com",
  "password": "password123",
  "adminRole": "TEACHER"
}
```

### Validation Rules

| Field       | Type   | Rules                                                 |
| ----------- | ------ | ----------------------------------------------------- |
| `fullName`  | string | Required, trimmed, minimum 1 character                |
| `email`     | string | Required, valid email address                         |
| `password`  | string | Required, minimum 8 characters                        |
| `adminRole` | string | Must be one of `SYSTEM_ADMIN`, `TEACHER`, `RECRUITER` |

### What the API Does

1. Validates the request body.
2. Checks whether an admin with the same email already exists.
3. Hashes the password with bcrypt.
4. Creates the admin record with the selected role.
5. Generates a 4-digit OTP.
6. Hashes and stores the OTP in `verifyToken`.
7. Sends the verification email.
8. Returns a success response.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Account created successfully now verify the eamil",
  "data": null,
  "success": true
}
```

### Possible Errors

| Status | Message                      | When it happens                             |
| ------ | ---------------------------- | ------------------------------------------- |
| `400`  | `Provided data are invalid`  | Request body fails validation               |
| `400`  | `This email is alredy taken` | An admin with the same email already exists |

### Rate Limiting

The admin login route is protected by `adminLoginLimiter`:

- Window: 10 minutes
- Limit: 20 requests

### Important Notes

- Admin registration uses the same OTP flow as student registration.
- The role is required at registration time.
- The controller currently attempts to send the verification email but does not surface mail sending failure in the HTTP response.

## Admin Email Verification

### Route

`POST /api/v{API_VERSION}/auth/admin-verify-email`

### Required Body

```json
{
  "otp": "1234",
  "email": "asha@example.com"
}
```

### Validation Rules

| Field   | Type   | Rules                         |
| ------- | ------ | ----------------------------- |
| `otp`   | string | Exactly 4 characters          |
| `email` | string | Must be a valid email address |

### What the API Does

1. Validates the request body.
2. Finds the admin by email.
3. Compares the supplied OTP with the hashed `verifyToken` stored in the database.
4. Marks the admin as verified by setting `emailVerifyed` to `true`.
5. Clears `verifyToken`.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Email verifyed login",
  "data": null,
  "success": true
}
```

### Possible Errors

| Status | Message                       | When it happens                            |
| ------ | ----------------------------- | ------------------------------------------ |
| `400`  | `Invalid data`                | Request body fails validation              |
| `400`  | `Provided email is not found` | No admin exists for the supplied email     |
| `400`  | `Invalid otp`                 | OTP does not match the stored hashed token |

## Logout

### Route

`POST /api/v{API_VERSION}/auth/logout`

### Auth Requirement

This route requires the `authMiddleware` to pass.

### Request Body

No request body is required.

### What the API Does

1. Reads the `accesstoken` cookie.
2. Clears the cookie.
3. Returns a success response.

### Success Response

```json
{
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": null,
  "success": true
}
```

### Important Notes

- Logout clears the cookie only.
- There is no token blacklist write in this handler.
- If the cookie is missing or invalid, the auth middleware rejects the request before logout runs.

## Auth Middleware Behavior

Protected routes currently use `authMiddleware`.

### What It Expects

- A cookie named `accesstoken`
- The cookie value must start with `Bearer `
- The JWT must verify with `ACCESS_TOKEN_SECRET`
- The token payload must contain `id`
- The `id` must match an existing student or admin record

### Errors Returned By Middleware

| Status | Message                                 | When it happens                         |
| ------ | --------------------------------------- | --------------------------------------- |
| `400`  | `Access denied, authenication required` | Cookie is missing                       |
| `400`  | `Access denied, authenication required` | Cookie is not a Bearer token            |
| `400`  | `Access denied, authenication required` | Bearer token is missing the JWT part    |
| `400`  | `Access denied, authenication required` | JWT payload does not contain `id`       |
| `400`  | `Access denied, authenication required` | Token user is not found in the database |

### Middleware Side Effect

When authentication succeeds, the middleware sets `req.id` to the matched student or admin ID.

## Global Error Responses

The global error handler normalizes different failure types.

### Zod Validation Errors

If validation reaches the global handler, the response looks like this:

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "data": null,
  "success": false,
  "meta": {
    "errors": [
      {
        "field": "password",
        "message": "Password must contain at least 8 characters",
        "code": "too_small"
      }
    ]
  }
}
```

### Invalid JSON Payload

Malformed JSON produces:

```json
{
  "statusCode": 400,
  "message": "Invalid JSON payload",
  "data": null,
  "success": false,
  "meta": {
    "errors": []
  }
}
```

### Unknown Server Errors

Unhandled errors become a `500` response. In `DEV`, the original message and stack may be included in `meta`.

## Data Stored During Authentication

### Student Table

Relevant fields used by auth:

- `fullName`
- `email`
- `password`
- `verifyToken`
- `emailVerified`
- `status`

### Admin Table

Relevant fields used by auth:

- `fullName`
- `email`
- `password`
- `role`
- `verifyToken`
- `emailVerifyed`
- `isActive`

## End-to-End Flow Summary

### Student Flow

1. Call `POST /register` with `fullName`, `email`, and `password`.
2. The server creates the student and sends an OTP email.
3. Call `POST /verify-email` with `email` and `otp`.
4. Call `POST /login` with `email` and `password`.
5. The server sets the `accesstoken` cookie.
6. Call `POST /logout` to clear the cookie.

### Admin Flow

1. Call `POST /admin-register` with `fullName`, `email`, `password`, and `adminRole`.
2. The server creates the admin and sends an OTP email.
3. Call `POST /admin-verify-email` with `email` and `otp`.
4. Call `POST /admin-login` with `email` and `password`.
5. The server sets the `accesstoken` cookie.
6. Call `POST /logout` to clear the cookie.

## Implementation Notes

- Passwords are hashed with bcrypt before storage.
- OTP values are hashed before storage.
- Access tokens are JWTs signed with `ACCESS_TOKEN_SECRET`.
- Access tokens are stored in an HTTP-only cookie, not returned in the JSON body.
- Student login is rate-limited at a higher threshold than admin login.
- The verification email template is generated from the OTP and user name.
