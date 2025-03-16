import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function (bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
		}
	});

	next();
});

async function startServer() {
	try {
		// First connect to MongoDB
		log("Starting server initialization...", "server");
		await connectDB();

		// Then setup routes and create HTTP server
		const server = await registerRoutes(app);

		// Error handling middleware
		app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
			const status = err.status || err.statusCode || 500;
			const message = err.message || "Internal Server Error";
			log(`Error: ${status} - ${message}`, "server");
			res.status(status).json({ message });
		});

		// Setup Vite or static serving based on environment
		if (app.get("env") === "development") {
			await setupVite(app, server);
		} else {
			serveStatic(app);
		}

		// Start the server
		const port = process.env.PORT || 5050;
		server.listen(port, "0.0.0.0", () => {
			log(`Server listening on port ${port}`, "server");
		});

		return server;
	} catch (error) {
		log(`Failed to start server: ${error}`, "server");
		process.exit(1);
	}
}

startServer();
