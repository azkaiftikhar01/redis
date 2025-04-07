# Redis Advanced Feature Demo

This script demonstrates advanced Redis use cases that are often required in high-performance, scalable applications. It covers concepts such as caching strategies, geospatial search, rate limiting, stream processing, pub/sub, and more.

## Key Features

1. **Structured User Metadata**: Storing and managing user session information using Redis Hashes.
2. **TTL-based Caching**: Cache HTML pages or expensive API responses with automatic expiration (TTL).
3. **GeoSpatial Search**: Efficient location-based queries using Redis' Geo commands for store locators or delivery areas.
4. **Redis Streams**: Track events like user login and read logs for audit and monitoring purposes.
5. **Pub/Sub**: Use Redis Pub/Sub for message-driven architecture, for example, to notify other services of user events like login.
6. **Bitmaps**: Efficiently track user activity and status, like login status, using Redis Bitmaps.
7. **HyperLogLog**: Approximate the number of unique visitors or items without storing all unique values.
8. **Rate Limiting**: Implement rate limiting with Lua scripts for API access or event handling.
9. **Advanced Caching Strategies**: Implementing multiple TTLs for different types of cache data to optimize memory usage.
10. **Redis Cluster**: Simulate Redis Cluster for distributed cache and data management.

## Prerequisites

- Redis (local or in a cluster setup)
- Node.js (v16+)
- `redis` npm package (v5+)

## Installation

First, install the necessary dependencies:

```bash
npm install redis
