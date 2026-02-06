import { describe, it, expect, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import helmet from "helmet";
import cors from "cors";

describe("Security Middleware Tests", () => {
    describe("Helmet Security Headers", () => {
        let app: Express;

        beforeEach(() => {
            app = express();
            app.use(helmet());
            app.get("/test", (_req, res) => {
                res.json({ message: "success" });
            });
        });

        it("should set X-Content-Type-Options header to nosniff", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-content-type-options"]).toBe("nosniff");
        });

        it("should set X-Frame-Options header to SAMEORIGIN", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
        });

        it("should set X-DNS-Prefetch-Control header to off", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-dns-prefetch-control"]).toBe("off");
        });

        it("should set Strict-Transport-Security header", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["strict-transport-security"]).toBeDefined();
            expect(response.headers["strict-transport-security"]).toContain("max-age=");
        });

        it("should set X-Download-Options header to noopen", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-download-options"]).toBe("noopen");
        });

        it("should set X-Permitted-Cross-Domain-Policies header to none", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-permitted-cross-domain-policies"]).toBe("none");
        });

        it("should remove X-Powered-By header", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["x-powered-by"]).toBeUndefined();
        });

        it("should set Content-Security-Policy header", async () => {
            const response = await request(app).get("/test");

            expect(response.headers["content-security-policy"]).toBeDefined();
        });

        it("should return successful response with all security headers", async () => {
            const response = await request(app).get("/test");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "success" });
            expect(response.headers["x-content-type-options"]).toBe("nosniff");
            expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
        });
    });

    describe("CORS Configuration", () => {
        let app: Express;
        const allowedOrigin = "http://localhost:3000";
        const forbiddenOrigin = "http://evil.com";

        beforeEach(() => {
            app = express();
            app.use(
                cors({
                    origin: (origin, callback) => {
                        if (!origin) return callback(null, true);
                        if (allowedOrigin === origin) {
                            callback(null, true);
                        } else {
                            callback(new Error("Not allowed by CORS"));
                        }
                    },
                    credentials: true,
                    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                    allowedHeaders: ["Content-Type", "Authorization"],
                })
            );
            app.get("/test", (_req, res) => {
                res.json({ message: "success" });
            });
        });

        it("should allow requests from allowed origin", async () => {
            const response = await request(app)
                .get("/test")
                .set("Origin", allowedOrigin);

            expect(response.status).toBe(200);
            expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
            expect(response.headers["access-control-allow-credentials"]).toBe("true");
        });

        it("should set correct CORS headers for allowed origin", async () => {
            const response = await request(app)
                .options("/test")
                .set("Origin", allowedOrigin)
                .set("Access-Control-Request-Method", "POST");

            expect(response.headers["access-control-allow-methods"]).toContain("GET");
            expect(response.headers["access-control-allow-methods"]).toContain("POST");
            expect(response.headers["access-control-allow-methods"]).toContain("PUT");
            expect(response.headers["access-control-allow-methods"]).toContain("DELETE");
            expect(response.headers["access-control-allow-methods"]).toContain("PATCH");
        });

        it("should allow requests without origin (same-origin requests)", async () => {
            const response = await request(app).get("/test");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "success" });
        });

        it("should set credentials header to true", async () => {
            const response = await request(app)
                .get("/test")
                .set("Origin", allowedOrigin);

            expect(response.headers["access-control-allow-credentials"]).toBe("true");
        });

        it("should allow specified headers", async () => {
            const response = await request(app)
                .options("/test")
                .set("Origin", allowedOrigin)
                .set("Access-Control-Request-Method", "POST")
                .set("Access-Control-Request-Headers", "Content-Type,Authorization");

            expect(response.headers["access-control-allow-headers"]).toContain("Content-Type");
            expect(response.headers["access-control-allow-headers"]).toContain("Authorization");
        });

        it("should handle preflight OPTIONS request", async () => {
            const response = await request(app)
                .options("/test")
                .set("Origin", allowedOrigin)
                .set("Access-Control-Request-Method", "POST");

            expect(response.status).toBe(204);
        });

        it("should allow all specified HTTP methods", async () => {
            const response = await request(app)
                .options("/test")
                .set("Origin", allowedOrigin)
                .set("Access-Control-Request-Method", "DELETE");

            expect(response.headers["access-control-allow-methods"]).toContain("DELETE");
            expect(response.headers["access-control-allow-methods"]).toContain("PATCH");
        });
    });

    describe("Combined Security Middleware", () => {
        let app: Express;

        beforeEach(() => {
            app = express();
            app.use(helmet());
            app.use(
                cors({
                    origin: (origin, callback) => {
                        if (!origin) return callback(null, true);
                        if (origin === "http://localhost:3000") {
                            callback(null, true);
                        } else {
                            callback(new Error("Not allowed by CORS"));
                        }
                    },
                    credentials: true,
                    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                    allowedHeaders: ["Content-Type", "Authorization"],
                })
            );
            app.use(express.json());
            app.get("/api/test", (_req, res) => {
                res.json({ message: "success" });
            });
            app.post("/api/test", (req, res) => {
                res.json({ received: req.body });
            });
        });

        it("should apply both helmet and CORS headers together", async () => {
            const response = await request(app)
                .get("/api/test")
                .set("Origin", "http://localhost:3000");

            expect(response.status).toBe(200);
            // Helmet headers
            expect(response.headers["x-content-type-options"]).toBe("nosniff");
            expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
            // CORS headers
            expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
            expect(response.headers["access-control-allow-credentials"]).toBe("true");
        });

        it("should handle POST requests with security headers", async () => {
            const response = await request(app)
                .post("/api/test")
                .set("Origin", "http://localhost:3000")
                .set("Content-Type", "application/json")
                .send({ test: "data" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ received: { test: "data" } });
            expect(response.headers["x-content-type-options"]).toBe("nosniff");
            expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
        });

        it("should protect against XSS with CSP header", async () => {
            const response = await request(app).get("/api/test");

            expect(response.headers["content-security-policy"]).toBeDefined();
        });
    });
});
