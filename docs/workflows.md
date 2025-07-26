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

Authentication via Bearer token required for all endpoints.
