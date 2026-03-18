# @repo/idempotency

Idempotency middleware for Hono to prevent duplicate request processing. Perfect for payment APIs, order creation, and any operation that should only execute once per unique request.

## Features

- 🔒 **Prevent Duplicates** - Automatically cache and replay responses
- ⚡ **Redis Storage** - Fast, distributed idempotency checks
- 🧪 **Memory Storage** - In-memory implementation for testing
- 🎯 **Type-Safe** - Full TypeScript support
- 🛡️ **Configurable** - Flexible key extraction and validation
- 📦 **Zero Config** - Sensible defaults out of the box

## How It Works

1. Client sends request with `Idempotency-Key` header
2. Middleware checks if key exists in storage
3. If exists → Return cached response immediately
4. If new → Process request and cache response for future requests

## Installation

This package is part of the monorepo and doesn't need separate installation.

```json
{
  "dependencies": {
    "@repo/idempotency": "workspace:*",
    "@repo/redis": "workspace:*"
  }
}
```

## Basic Usage

### Setup with Redis

```typescript
import { Hono } from "hono";
import { createRedisClient } from "@repo/redis";
import { idempotency, RedisIdempotencyStorage } from "@repo/idempotency";

const redis = createRedisClient({ url: process.env.REDIS_URL });
const storage = new RedisIdempotencyStorage(redis);

const app = new Hono();

// Apply to all routes
app.use("*", idempotency(storage));

// Protected route
app.post("/api/payments", async (c) => {
  // This will only execute once per unique Idempotency-Key
  const payment = await processPayment();
  return c.json({ success: true, payment }, 201);
});
```

### Client Usage

```typescript
// Frontend/Client
const response = await fetch("/api/payments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(), // Generate unique key
  },
  body: JSON.stringify({ amount: 100 }),
});

// If request fails and is retried with same key,
// the cached response is returned (no duplicate charge)
```

## Advanced Configuration

### Custom TTL and Methods

```typescript
app.use(
  "/api/*",
  idempotency(storage, {
    ttl: 3600, // Cache for 1 hour instead of default 24h
    methods: ["POST", "PUT"], // Only these HTTP methods
    headerName: "X-Request-ID", // Custom header name
    keyPrefix: "myapp:", // Custom Redis key prefix
    enableLogging: true, // Log idempotency checks
  })
);
```

### Custom Key Extraction

```typescript
app.use(
  "/api/*",
  idempotency(storage, {
    // Extract from query param or header
    keyExtractor: (c) => {
      return c.req.query("requestId") || c.req.header("X-Request-ID") || null;
    },
  })
);
```

### Skip Certain Requests

```typescript
app.use(
  "/api/*",
  idempotency(storage, {
    skip: (c) => {
      // Skip GET requests or health checks
      return c.req.method === "GET" || c.req.path === "/health";
    },
  })
);
```

### Custom Error Handling

```typescript
app.use(
  "/api/*",
  idempotency(storage, {
    onInvalidKey: (c) => {
      return c.json(
        {
          error: "Please provide a valid UUID as Idempotency-Key header",
        },
        400
      );
    },
  })
);
```

## Storage Options

### Redis Storage (Production)

```typescript
import { createRedisClient } from "@repo/redis";
import { RedisIdempotencyStorage } from "@repo/idempotency";

const redis = createRedisClient({
  url: process.env.REDIS_URL,
  keyPrefix: "app1:", // Isolate from other apps
});

const storage = new RedisIdempotencyStorage(redis, "idem:");
```

### Memory Storage (Testing/Development)

```typescript
import { MemoryIdempotencyStorage } from "@repo/idempotency";

const storage = new MemoryIdempotencyStorage();

// Good for unit tests
afterEach(() => {
  storage.clear(); // Reset between tests
});
```

### Custom Storage

Implement the `IdempotencyStorage` interface:

```typescript
import type { IdempotencyStorage, IdempotentResponse } from "@repo/idempotency";

class DatabaseIdempotencyStorage implements IdempotencyStorage {
  async get(key: string): Promise<IdempotentResponse | null> {
    // Your implementation
  }

  async set(key: string, response: IdempotentResponse, ttl: number): Promise<void> {
    // Your implementation
  }

  async delete(key: string): Promise<void> {
    // Your implementation
  }

  async exists(key: string): Promise<boolean> {
    // Your implementation
  }
}
```

## Multiple Apps Setup

Each backend can use its own storage with different prefixes:

```typescript
// apps/admin/src/app.ts
const adminStorage = new RedisIdempotencyStorage(redis, "admin:idem:");
app.use("/api/*", idempotency(adminStorage));

// apps/api/src/app.ts
const apiStorage = new RedisIdempotencyStorage(redis, "api:idem:");
app.use("/v1/*", idempotency(apiStorage));
```

## Best Practices

### 1. Generate Keys Client-Side

```typescript
// ✅ Good - Client controls the key
const idempotencyKey = crypto.randomUUID();

fetch("/api/payment", {
  headers: { "Idempotency-Key": idempotencyKey },
});
```

### 2. Store Key for Retries

```typescript
// ✅ Good - Retry with same key
let idempotencyKey = localStorage.getItem("payment-key");
if (!idempotencyKey) {
  idempotencyKey = crypto.randomUUID();
  localStorage.setItem("payment-key", idempotencyKey);
}

try {
  await createPayment(idempotencyKey);
  localStorage.removeItem("payment-key"); // Success, clear it
} catch (error) {
  // Keep key for retry
}
```

### 3. Set Appropriate TTL

```typescript
// Payment: Cache for 24 hours
app.use("/api/payments", idempotency(storage, { ttl: 86400 }));

// Order creation: Cache for 1 hour
app.use("/api/orders", idempotency(storage, { ttl: 3600 }));
```

### 4. Check Replayed Responses

```typescript
const response = await fetch("/api/payment", {
  headers: { "Idempotency-Key": key },
});

if (response.headers.get("X-Idempotency-Replayed") === "true") {
  console.log("This is a cached response");
}
```

## Common Use Cases

### 1. Payment Processing

```typescript
app.post("/api/payments", async (c) => {
  const { amount, currency } = await c.req.json();

  const payment = await stripe.charges.create({
    amount,
    currency,
    idempotency_key: c.req.header("Idempotency-Key"), // Pass to Stripe too
  });

  return c.json({ success: true, payment }, 201);
});
```

### 2. Order Creation

```typescript
app.post("/api/orders", async (c) => {
  const order = await c.req.json();

  const created = await db.order.create({
    data: {
      ...order,
      idempotencyKey: c.req.header("Idempotency-Key"),
    },
  });

  return c.json(created, 201);
});
```

### 3. Webhook Processing

```typescript
app.post("/webhooks/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  const event = stripe.webhooks.constructEvent(
    await c.req.text(),
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  // Process webhook event
  await handleWebhookEvent(event);

  return c.json({ received: true });
});
```

## Troubleshooting

### Responses Not Being Cached

- Check that status code is < 500
- Verify Redis connection is working
- Enable logging to see what's happening

### Memory Leaks

- Set appropriate TTL values
- Monitor Redis memory usage
- Use key prefixes to identify old keys

## Links

- [Stripe Idempotency Guide](https://stripe.com/docs/api/idempotent_requests)
- [HTTP Idempotency RFC](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header)
