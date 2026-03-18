# @repo/redis

Redis client package with TypeScript support and helpful utilities for the monorepo.

## Features

- 🚀 Built on top of `ioredis` - the most popular Redis client
- 🔒 Type-safe cache operations
- 🔄 Connection pooling and singleton pattern
- ⚡ Helper methods for common operations
- 🛡️ Error handling and retries
- 📦 Zero configuration with sensible defaults

## Installation

This package is part of the monorepo and doesn't need separate installation.

```json
{
  "dependencies": {
    "@repo/redis": "workspace:*"
  }
}
```

## Usage

### Basic Setup

```typescript
// In your app (e.g., apps/admin/src/redis.ts)
import { createRedisClient } from "@repo/redis";

export const redis = createRedisClient({
  url: process.env.REDIS_URL,
  keyPrefix: "admin:", // Optional: prefix all keys
});
```

### Using Singleton Pattern (Recommended)

```typescript
import { getRedisClient } from "@repo/redis";

// Same instance across imports - prevents connection overload
export const redis = getRedisClient(
  {
    url: process.env.REDIS_URL,
    keyPrefix: "admin:",
  },
  "admin-redis", // Unique key for this database
);
```

### Cache Utilities

```typescript
import { createRedisClient, createCache } from "@repo/redis";

const redis = createRedisClient({ url: process.env.REDIS_URL });
const cache = createCache(redis);

// Set with TTL (time to live)
await cache.set("user:123", { name: "John", email: "john@example.com" }, { ttl: 3600 });

// Get typed value
const user = await cache.get<User>("user:123");

// Get or compute (fetch from cache or execute function)
const user = await cache.getOrSet(
  "user:123",
  async () => {
    return await db.user.findUnique({ where: { id: "123" } });
  },
  { ttl: 3600 }
);

// Delete single key
await cache.del("user:123");

// Delete by pattern
await cache.delPattern("user:*");

// Check existence
const exists = await cache.has("user:123");

// Increment/Decrement
await cache.increment("views:post:123");
await cache.decrement("stock:item:456", 5);
```

### Direct Redis Operations

```typescript
import { createRedisClient } from "@repo/redis";

const redis = createRedisClient({ url: process.env.REDIS_URL });

// All ioredis methods are available
await redis.set("key", "value");
await redis.get("key");
await redis.del("key");

// Lists
await redis.lpush("queue", "job1");
await redis.rpop("queue");

// Sets
await redis.sadd("tags", "nodejs", "redis");
await redis.smembers("tags");

// Hashes
await redis.hset("user:123", "name", "John");
await redis.hgetall("user:123");

// Pub/Sub
await redis.publish("channel", "message");
```

### Environment Variables

```env
# .env
REDIS_URL=redis://localhost:6379
# or
REDIS_URL=redis://:password@host:port/db
```

### Multiple Redis Instances

```typescript
// apps/admin/src/redis.ts
export const mainRedis = getRedisClient(
  { url: process.env.REDIS_URL },
  "main"
);

export const cacheRedis = getRedisClient(
  { url: process.env.REDIS_CACHE_URL },
  "cache"
);
```

### Graceful Shutdown

```typescript
import { disconnectRedis } from "@repo/redis";
import { redis } from "./redis";

process.on("SIGTERM", async () => {
  await disconnectRedis(redis);
  process.exit(0);
});
```

## Configuration Options

```typescript
interface RedisClientConfig {
  url?: string;                      // Redis connection URL (recommended)
  host?: string;                     // Redis host (default: localhost)
  port?: number;                     // Redis port (default: 6379)
  password?: string;                 // Redis password
  db?: number;                       // Database number (default: 0)
  keyPrefix?: string;                // Prefix for all keys
  maxRetriesPerRequest?: number;     // Max retries (default: 3)
  connectTimeout?: number;           // Timeout in ms (default: 10000)
  enableOfflineQueue?: boolean;      // Queue commands when offline (default: true)
  options?: Partial<RedisOptions>;   // Additional ioredis options
}
```

## Best Practices

1. **Use Environment Variables** - Never hardcode Redis URLs
2. **Use Singleton Pattern** - Prevent connection overload in development
3. **Set Key Prefixes** - Avoid key collisions between apps
4. **Set TTL** - Prevent memory leaks with expiring keys
5. **Handle Errors** - Wrap Redis calls in try-catch
6. **Graceful Shutdown** - Close connections on app termination

## Links

- [ioredis Documentation](https://github.com/redis/ioredis)
- [Redis Commands](https://redis.io/commands/)
