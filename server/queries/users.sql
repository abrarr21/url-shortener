-- name: CreateUser :one
INSERT INTO users (id, name, email, password_hash)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetURLsByUserID :many
SELECT * FROM urls
WHERE user_id = $1
ORDER BY created_at DESC;
