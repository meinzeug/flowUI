# Hive Log API

## GET /api/hive/logs
Returns hive activity log entries.

### Query Parameters
- `page` - Page number, default `1`.
- `limit` - Entries per page, default `50`.

### Response
```json
[
  {"id":1,"timestamp":"2025-01-01T00:00:00Z","type":"info","message":"started"}
]
```
