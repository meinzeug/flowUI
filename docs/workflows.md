# Workflow API

## GET /api/workflows
Returns a list of all workflows.

## POST /api/workflows
Creates a new workflow.

### Request Body
```json
{ "name": "string", "description": "string", "steps": [{"name":"step","command":"tool"}] }
```

## GET /api/workflows/:id
Returns one workflow.

## PUT /api/workflows/:id
Updates a workflow.

## DELETE /api/workflows/:id
Deletes a workflow.

## POST /api/workflows/:id/execute
Queues a workflow for execution.

### Response
```json
{ "queued": true }
```

## GET /api/workflows/queue
Returns the current workflow queue for the authenticated user.

## GET /api/workflows/queue/:id
Returns details for a single queue item.

### Response
```json
{ "id": 1, "workflow_id": "uuid", "name": "Workflow", "status": "queued", "progress": 0, "created_at": "2025-09-10T12:00:00Z" }
```

## POST /api/workflows/queue/:id/cancel
Cancels a queued or running workflow job.

### Response
```json
{ "cancelled": true }
```

## GET /api/workflows/queue/:id/logs
Returns log lines for a queue item.

### Response
```json
[
  { "id": 1, "queue_id": 1, "message": "hello", "created_at": "2025-09-10T12:00:00Z" }
]
```

Authentication via Bearer token required for all endpoints.
