const redis = require("redis");

(async () => {
  const client = redis.createClient();
  await client.connect();

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  // =======================================================================
  // 1. Structured User Metadata - HASH
  // =======================================================================
  console.log("1. Adding user session metadata...");
  await client.hSet("user:session:123", {
    user_id: "123",
    username: "alice123",
    status: "active",
    last_seen: Date.now(),
    plan: "premium",
    last_login_ip: "192.168.0.1",
    last_login_time: Date.now(),
  });

  const sessionData = await client.hGetAll("user:session:123");
  console.log("User session data:", sessionData);

  // =======================================================================
  // 2. In-Memory Caching with TTL - Cache Homepage HTML
  // =======================================================================
  console.log("2. Caching homepage HTML...");
  await client.set("cache:homepage:/landing", "<html>Homepage HTML content...</html>", {
    EX: 120, // Cache the page for 120 seconds
  });

  const cachedHTML = await client.get("cache:homepage:/landing");
  console.log("Cached homepage HTML:", cachedHTML);

  // =======================================================================
  // 3. GeoSpatial - Store Finder (Using Geo commands)
  // =======================================================================
  console.log("3. Adding store locations (GeoSpatial)...");

  await client.geoAdd("stores:locations", [
    { longitude: 77.5946, latitude: 12.9716, member: "store:blore" },
    { longitude: 72.8777, latitude: 19.0760, member: "store:mumbai" },
    { longitude: 88.3639, latitude: 22.5726, member: "store:kolkata" },
    { longitude: 79.0193, latitude: 21.1466, member: "store:nagpur" },
  ]);

  const nearbyStores = await client.geoSearch("stores:locations", {
    longitude: 77.6,
    latitude: 12.9,
    radius: 100,
    unit: "km",
    WITHDIST: true, // Include distance from the given point
  });

  console.log("Nearby stores within 100 km:", nearbyStores);

  // =======================================================================
  // 4. Redis Streams - Activity Log for User Actions
  // =======================================================================
  console.log("4. Adding user activity to Redis Streams...");
  const streamKey = "events:user:activity";

  const entryId = await client.xAdd(streamKey, "*", {
    event: "login",
    user_id: "123",
    ip: "192.168.0.1",
    device: "mobile",
    ts: Date.now(),
  });

  console.log("Stream entry ID:", entryId);

  const streamRead = await client.xRead(
    { key: streamKey, id: "0-0" },
    { COUNT: 5 }
  );

  console.log("Stream entries read:", streamRead);

  // =======================================================================
  // 5. Pub/Sub - Publish & Subscribe Example
  // =======================================================================
  console.log("5. Pub/Sub example: User login event...");
  const pub = client.duplicate();
  const sub = client.duplicate();
  await pub.connect();
  await sub.connect();

  await sub.subscribe("event:auth:login", (message) => {
    console.log("Received pub/sub login event:", message);
  });

  await pub.publish("event:auth:login", JSON.stringify({ user_id: "123", ts: Date.now() }));
  await new Promise((res) => setTimeout(res, 500)); // Wait for delivery

  // =======================================================================
  // 6. Bitmaps - Track Active Users for the Day
  // =======================================================================
  console.log("6. Using Bitmaps for active user tracking...");
  await client.setBit("users:active:2025-04-07", 123, 1); // Mark user 123 as active
  const isUserActive = await client.getBit("users:active:2025-04-07", 123);
  console.log("Is user 123 active today (bitmap):", isUserActive);

  // =======================================================================
  // 7. HyperLogLog - Approximate Unique Visitors
  // =======================================================================
  console.log("7. Using HyperLogLog to approximate unique visits...");
  await client.pfAdd("visits:homepage", "user:123", "user:456", "user:789");
  const estUniqueVisits = await client.pfCount("visits:homepage");
  console.log("Estimated unique visits:", estUniqueVisits);

  // =======================================================================
  // 8. Rate Limiting using Redis with Lua Scripting
  // =======================================================================
  console.log("8. Rate limiting with Lua Scripting...");
  const script = `
    local current = redis.call('get', KEYS[1])
    if current and tonumber(current) >= tonumber(ARGV[1]) then
      return 0
    end
    redis.call('incr', KEYS[1])
    redis.call('expire', KEYS[1], ARGV[2])
    return 1
  `;
  
  const rateLimited = await client.eval(script, {
    keys: ["user:rate_limit:123"],
    arguments: [5, 60], // 5 requests per 60 seconds
  });

  console.log("Rate limit exceeded:", rateLimited === 0 ? "Yes" : "No");

  // =======================================================================
  // 9. Advanced Caching Strategy with Multiple TTLs (LRU Eviction)
  // =======================================================================
  console.log("9. Advanced caching strategy with multiple TTLs...");
  await client.set("cache:item:123", JSON.stringify({ name: "Product 123", price: 50 }), {
    EX: 300, // 5 minutes TTL for frequently accessed items
  });

  await client.set("cache:item:124", JSON.stringify({ name: "Product 124", price: 60 }), {
    EX: 900, // 15 minutes TTL for less frequently accessed items
  });

  const cacheItem123 = await client.get("cache:item:123");
  const cacheItem124 = await client.get("cache:item:124");

  console.log("Cache item 123:", cacheItem123);
  console.log("Cache item 124:", cacheItem124);

  // =======================================================================
  // 10. Redis Cluster Simulation (Using Multiple Redis Instances)
  // =======================================================================
  console.log("10. Simulating Redis Cluster...");
  const clusterClient = redis.createClusterClient({
    nodes: [
      { host: "localhost", port: 6379 },
      { host: "localhost", port: 6380 },
      { host: "localhost", port: 6381 },
    ],
  });

  await clusterClient.connect();
  await clusterClient.set("cluster:node:test", "Redis Cluster Test");

  const clusterValue = await clusterClient.get("cluster:node:test");
  console.log("Cluster value:", clusterValue);

  // =======================================================================
  // Wrap Up and Clean Up
  // =======================================================================
  console.log("Closing Redis connections...");
  await pub.quit();
  await sub.quit();
  await client.quit();
})();
