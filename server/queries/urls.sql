-- name: CreateURL :one
INSERT INTO urls (id, short_code, long_url, user_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUrlByShortCode :one
SELECT * FROM urls
WHERE short_code = $1;

-- name: IncrementClickCount :exec
UPDATE urls
SET click_count = click_count + 1
WHERE short_code = $1;
