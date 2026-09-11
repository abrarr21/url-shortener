-- KEYS[1] = bucket key (e.g. "ratelimit:203.0.113.5")
-- ARGV[1] = capacity (max tokens the bucket can hold)
-- ARGV[2] = refill_rate (tokens added per second)
-- ARGV[3] = requested (tokens this request costs, normally 1)
--
-- Uses Redis's own clock (TIME command) instead of a timestamp passed in
-- from the Go app — this avoids clock-skew issues between multiple API
-- instances calling this script from different machines.

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])

local time_result = redis.call("TIME")
local now = tonumber(time_result[1]) + (tonumber(time_result[2]) / 1000000)

local bucket = redis.call("HMGET", key, "tokens", "last_refill")
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

-- first request from this client: bucket starts full
if tokens == nil then
	tokens = capacity
	last_refill = now
end

-- refill based on time elapsed since we last touched this bucket
local elapsed = now - last_refill
local refill_amount = elapsed * refill_rate
tokens = math.min(capacity, tokens + refill_amount)

local allowed = 0
if tokens >= requested then
	tokens = tokens - requested
	allowed = 1
end

redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
-- let the bucket expire if the client goes quiet for a while (2x the time to fully refill)
redis.call("EXPIRE", key, math.ceil((capacity / refill_rate) * 2))

return { allowed, math.floor(tokens) }
