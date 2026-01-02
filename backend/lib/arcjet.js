import arcjet, { tokenBucket } from "@arcjet/next";

const hasKey = Boolean(process.env.ARCJET_KEY);

const aj = hasKey
  ? arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: ["userId"], // Track based on Clerk userId
      rules: [
        tokenBucket({
          mode: "LIVE",
          refillRate: 10,
          interval: 3600,
          capacity: 10,
        }),
      ],
    })
  : {
      // No-op fallback when ARCJET_KEY is not set
      protect: async () => ({
        isDenied: () => false,
        reason: { isRateLimit: () => false },
      }),
    };

export default aj;
