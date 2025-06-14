import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
console.log("Loaded environment variables:", process.env);

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' })); // Use express.json, optionally increase limit for base64 strings if needed
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// For Production: Serve static files from the client build
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	// For any other request, serve the index.html file
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log(`Server started at this port: ${PORT}`);
	// No need to call connectDB() anymore!
});