-- name: MarkEventProcessed :execrows
INSERT INTO processed_events(event_id)
VALUES($1)
ON CONFLICT DO NOTHING;
