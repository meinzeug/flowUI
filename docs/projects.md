# Project API

## POST /api/projects
Creates a new project for the authenticated user.

### Request Body
```json
{
  "name": "string",
  "description": "string" // optional
}
```

### Response
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "created_at": "timestamp"
}
```

Authentication via Bearer token is required.

## GET /api/projects
Returns a list of all projects belonging to the authenticated user.

### Response
```json
[
  { "id": 1, "name": "string", "description": "string", "created_at": "timestamp" }
]
```

## PUT /api/projects/:id
Updates an existing project. Only `name` and `description` can be changed.

### Request Body
```json
{ "name": "string", "description": "string" }
```

### Response
```json
{ "id": 1, "name": "string", "description": "string", "created_at": "timestamp" }
```

## DELETE /api/projects/:id
Deletes a project.

### Response
```json
{ "deleted": true }
```
