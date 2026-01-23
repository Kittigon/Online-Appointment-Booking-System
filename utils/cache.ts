import redis from "@/utils/redis";

// อ่าน cache
export async function getCache(key: string) {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
}

// เขียน cache
export async function setCache(
    key: string,
    data: any,
    ttl = 60 // วินาที
) {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
}

// ลบ cache
export async function delCache(key: string) {
    await redis.del(key);
}
