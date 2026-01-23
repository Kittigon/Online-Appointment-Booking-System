import Redis from "ioredis";

const globalForRedis = global as unknown as {
    redis?: Redis;
};

export const redis =
    globalForRedis.redis ??
    new Redis(process.env.REDIS_URL!);

if (!globalForRedis.redis) {
    redis.on("error", (err) => {
        console.error("Redis error:", err);
    });

    globalForRedis.redis = redis;
}

export default redis;
