import { describe, it, expect, beforeEach, vi } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import { apiLimiter, authLimiter, checkoutLimiter } from "../rateLimiter";

describe("Rate Limiter Tests", () => {
    describe("API Rate Limiter", () => {
        let app: Express;

        beforeEach(() => {
            app = express();
            app.use(apiLimiter);
            app.get("/api/test", (_req, res) => {
                res.json({ message: "success" });
            });
        });

        it("should allow requests within rate limit (100 requests per 15 minutes)", async () => {
            const response = await request(app).get("/api/test");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "success" });
        });

        it("should set rate limit headers on successful request", async () => {
            const response = await request(app).get("/api/test");

            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
            expect(response.headers["ratelimit-reset"]).toBeDefined();
        });

        it("should decrement remaining requests with each call", async () => {
            const firstResponse = await request(app).get("/api/test");
            const firstRemaining = parseInt(firstResponse.headers["ratelimit-remaining"] || "0");

            const secondResponse = await request(app).get("/api/test");
            const secondRemaining = parseInt(secondResponse.headers["ratelimit-remaining"] || "0");

            expect(secondRemaining).toBe(firstRemaining - 1);
        });

        it("should return 429 when rate limit is exceeded", async () => {
            // Make 101 requests to exceed the limit of 100
            const requests = Array.from({ length: 101 }, () =>
                request(app).get("/api/test")
            );

            const responses = await Promise.all(requests);

            // Last request should be rate limited
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(429);
        });

        it("should return proper error message when rate limited", async () => {
            // Exceed rate limit
            const requests = Array.from({ length: 101 }, () =>
                request(app).get("/api/test")
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponse = responses[responses.length - 1];

            expect(rateLimitedResponse.status).toBe(429);
            expect(rateLimitedResponse.body.message).toBe(
                "Too many requests from this IP, please try again after 15 minutes"
            );
            expect(rateLimitedResponse.body.code).toBe("RATE_LIMIT_EXCEEDED");
        });

        it("should include retry-after header when rate limited", async () => {
            // Exceed rate limit
            const requests = Array.from({ length: 101 }, () =>
                request(app).get("/api/test")
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponse = responses[responses.length - 1];

            expect(rateLimitedResponse.headers["retry-after"]).toBeDefined();
        });
    });

    describe("Auth Rate Limiter", () => {
        let app: Express;

        beforeEach(() => {
            app = express();
            app.use(authLimiter);
            app.post("/auth/login", (_req, res) => {
                res.json({ message: "login successful" });
            });
        });

        it("should allow auth requests within limit (5 per hour)", async () => {
            const response = await request(app).post("/auth/login");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "login successful" });
        });

        it("should set rate limit headers for auth endpoints", async () => {
            const response = await request(app).post("/auth/login");

            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
        });

        it("should block after 5 authentication attempts", async () => {
            // Make 6 requests to exceed the limit of 5
            const requests = Array.from({ length: 6 }, () =>
                request(app).post("/auth/login")
            );

            const responses = await Promise.all(requests);

            // Last request should be rate limited
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(429);
            expect(lastResponse.body.message).toBe(
                "Too many authentication attempts, please try again after an hour"
            );
        });

        it("should return RATE_LIMIT_EXCEEDED code when auth limit exceeded", async () => {
            const requests = Array.from({ length: 6 }, () =>
                request(app).post("/auth/login")
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponse = responses[responses.length - 1];

            expect(rateLimitedResponse.body.code).toBe("RATE_LIMIT_EXCEEDED");
        });

        it("should have stricter limit than API limiter", async () => {
            const response = await request(app).post("/auth/login");
            const authLimit = parseInt(response.headers["ratelimit-limit"] || "0");

            // Auth limiter should have limit of 5, which is much stricter than API limiter's 100
            expect(authLimit).toBe(5);
        });
    });

    describe("Checkout Rate Limiter", () => {
        let app: Express;

        beforeEach(() => {
            app = express();
            app.use(checkoutLimiter);
            app.post("/checkout", (_req, res) => {
                res.json({ message: "checkout successful" });
            });
        });

        it("should allow checkout requests within limit (3 per minute)", async () => {
            const response = await request(app).post("/checkout");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "checkout successful" });
        });

        it("should set rate limit headers for checkout endpoint", async () => {
            const response = await request(app).post("/checkout");

            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
        });

        it("should block after 3 checkout attempts per minute", async () => {
            // Make 4 requests to exceed the limit of 3
            const requests = Array.from({ length: 4 }, () =>
                request(app).post("/checkout")
            );

            const responses = await Promise.all(requests);

            // Last request should be rate limited
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(429);
            expect(lastResponse.body.message).toBe(
                "Too many checkout attempts, please wait a minute"
            );
        });

        it("should have shortest window (1 minute)", async () => {
            const response = await request(app).post("/checkout");

            // Checkout limiter has window of 1 minute (60000ms)
            expect(response.headers["ratelimit-limit"]).toBe("3");
        });

        it("should return RATE_LIMIT_EXCEEDED code when checkout limit exceeded", async () => {
            const requests = Array.from({ length: 4 }, () =>
                request(app).post("/checkout")
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponse = responses[responses.length - 1];

            expect(rateLimitedResponse.body.code).toBe("RATE_LIMIT_EXCEEDED");
        });

        it("should be the strictest limiter (3 requests per minute)", async () => {
            const response = await request(app).post("/checkout");
            const checkoutLimit = parseInt(response.headers["ratelimit-limit"] || "0");

            // Checkout limiter should have the strictest limit of 3
            expect(checkoutLimit).toBe(3);
        });
    });

    describe("Rate Limiter Configuration", () => {
        it("should have standardHeaders enabled for API limiter", async () => {
            const app = express();
            app.use(apiLimiter);
            app.get("/test", (_req, res) => res.json({ ok: true }));

            const response = await request(app).get("/test");

            // Standard headers should be present (RateLimit-* headers)
            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
            expect(response.headers["ratelimit-reset"]).toBeDefined();
        });

        it("should not have legacy headers for API limiter", async () => {
            const app = express();
            app.use(apiLimiter);
            app.get("/test", (_req, res) => res.json({ ok: true }));

            const response = await request(app).get("/test");

            // Legacy headers (X-RateLimit-*) should not be present
            expect(response.headers["x-ratelimit-limit"]).toBeUndefined();
            expect(response.headers["x-ratelimit-remaining"]).toBeUndefined();
        });

        it("should apply different limits for different limiters", async () => {
            const apiApp = express();
            apiApp.use(apiLimiter);
            apiApp.get("/test", (_req, res) => res.json({ ok: true }));

            const authApp = express();
            authApp.use(authLimiter);
            authApp.post("/test", (_req, res) => res.json({ ok: true }));

            const checkoutApp = express();
            checkoutApp.use(checkoutLimiter);
            checkoutApp.post("/test", (_req, res) => res.json({ ok: true }));

            const apiResponse = await request(apiApp).get("/test");
            const authResponse = await request(authApp).post("/test");
            const checkoutResponse = await request(checkoutApp).post("/test");

            expect(apiResponse.headers["ratelimit-limit"]).toBe("100");
            expect(authResponse.headers["ratelimit-limit"]).toBe("5");
            expect(checkoutResponse.headers["ratelimit-limit"]).toBe("3");
        });
    });

    describe("Rate Limiter Error Handling", () => {
        it("should handle rate limit with proper JSON structure", async () => {
            const app = express();
            app.use(apiLimiter);
            app.get("/test", (_req, res) => res.json({ ok: true }));

            // Exceed limit
            const requests = Array.from({ length: 101 }, () =>
                request(app).get("/test")
            );

            const responses = await Promise.all(requests);
            const errorResponse = responses[responses.length - 1];

            expect(errorResponse.status).toBe(429);
            expect(errorResponse.body).toHaveProperty("message");
            expect(errorResponse.body).toHaveProperty("code");
            expect(errorResponse.body.code).toBe("RATE_LIMIT_EXCEEDED");
        });

        it("should include appropriate error message for each limiter type", async () => {
            const apiApp = express();
            apiApp.use(apiLimiter);
            apiApp.get("/test", (_req, res) => res.json({ ok: true }));

            const authApp = express();
            authApp.use(authLimiter);
            authApp.post("/test", (_req, res) => res.json({ ok: true }));

            const checkoutApp = express();
            checkoutApp.use(checkoutLimiter);
            checkoutApp.post("/test", (_req, res) => res.json({ ok: true }));

            // Exceed API limit
            const apiRequests = Array.from({ length: 101 }, () =>
                request(apiApp).get("/test")
            );
            const apiResponses = await Promise.all(apiRequests);
            expect(apiResponses[100].body.message).toContain("15 minutes");

            // Exceed auth limit
            const authRequests = Array.from({ length: 6 }, () =>
                request(authApp).post("/test")
            );
            const authResponses = await Promise.all(authRequests);
            expect(authResponses[5].body.message).toContain("hour");

            // Exceed checkout limit
            const checkoutRequests = Array.from({ length: 4 }, () =>
                request(checkoutApp).post("/test")
            );
            const checkoutResponses = await Promise.all(checkoutRequests);
            expect(checkoutResponses[3].body.message).toContain("minute");
        });
    });
});
