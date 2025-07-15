// api/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Rate limiting for auth endpoints - More lenient for development
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs (increased from 5)
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for successful requests
        return req.method === 'GET' || process.env.NODE_ENV === 'development';
    },
    onLimitReached: (req, res) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
    }
});

export const signup = async (req, res) => {
    try {
        const { name, email, password, age, gender, genderPreference, location } = req.body;
        
        // Validation
        if (!name || !email || !password || !age || !gender || !genderPreference) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (age < 18) {
            return res.status(400).json({ success: false, message: "You must be at least 18 years old" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already in use." });
        }

        // Create new user
        const userData = {
            name,
            email,
            password,
            age,
            gender,
            genderPreference,
            images: [],
            prompts: [],
            questionnaire: {},
            behaviorMetrics: {},
            credibilityScore: 70,
            behaviorIndex: 85,
            lastActive: new Date(),
            onlineStatus: 'online'
        };

        // Add location if provided
        if (location && location.coordinates) {
            userData.location = {
                type: 'Point',
                coordinates: [location.coordinates[1], location.coordinates[0]] // [longitude, latitude]
            };
        }

        const newUser = await User.create(userData);

        // Generate tokens
        const token = signToken(newUser._id);
        const refreshToken = signRefreshToken(newUser._id);

        // Set cookies
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        // Return user without password
        const userToReturn = newUser.toObject();
        delete userToReturn.password;

        res.status(201).json({ 
            success: true, 
            user: userToReturn,
            message: "Account created successfully! Complete your profile to start matching."
        });
    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Find user and check if account is locked
        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({ 
                success: false, 
                message: "Account temporarily locked due to too many failed login attempts. Please try again later." 
            });
        }

        // Check password
        const isPasswordValid = await user.matchPassword(password);
        
        if (!isPasswordValid) {
            // Increment login attempts
            await user.incLoginAttempts();
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last active and online status
        user.lastActive = new Date();
        user.onlineStatus = 'online';
        await user.save({ validateBeforeSave: false });

        // Generate tokens
        const token = signToken(user._id);
        const refreshToken = signRefreshToken(user._id);

        // Set cookies
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        // Return user without password
        const userToReturn = user.toObject();
        delete userToReturn.password;

        res.status(200).json({ 
            success: true, 
            user: userToReturn,
            message: "Logged in successfully"
        });
    } catch (error) {
        console.log("Error in login controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Update user's online status
        if (req.user && req.user.id) {
            await User.findByIdAndUpdate(req.user.id, { 
                onlineStatus: 'offline',
                lastActive: new Date()
            });
        }

        // Clear cookies
        res.clearCookie("jwt");
        res.clearCookie("refreshToken");
        
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        // Generate new access token
        const newToken = signToken(user._id);
        
        res.cookie("jwt", newToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({ success: true, message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refresh token controller:", error);
        res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
};

export const updateOnlineStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['online', 'offline', 'away'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                onlineStatus: status,
                lastActive: new Date()
            },
            { new: true }
        ).select('-password');

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in update online status controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in get profile controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};