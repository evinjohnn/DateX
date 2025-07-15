// api/controllers/matchController.js
import User from "../models/User.js";
import Like from "../models/Like.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import { matchingAlgorithm } from "../utils/matchingAlgorithm.js";
import { groqAI } from "../utils/groqAI.js";

export const getDiscoverFeed = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const users = await matchingAlgorithm.getDiscoveryFeed(
            req.user.id,
            parseInt(limit)
        );

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log("Error in getDiscoverFeed: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getStandoutsFeed = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const standouts = await matchingAlgorithm.getStandouts(
            req.user.id,
            parseInt(limit)
        );
        
        res.status(200).json({ success: true, users: standouts });
    } catch (error) {
        console.log("Error in getStandoutsFeed: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const sendLike = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const { likedContent, comment, isRose, isSuperLike } = req.body;
        
        const sender = await User.findById(req.user.id);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if user has enough roses/super likes
        if (isRose && sender.roses < 1) {
            return res.status(400).json({ success: false, message: "Not enough roses." });
        }

        if (isSuperLike) {
            if (sender.superLikesUsed >= sender.superLikesDaily) {
                return res.status(400).json({ success: false, message: "Daily super likes limit reached." });
            }
            sender.superLikesUsed += 1;
        }

        // Deduct roses if used
        if (isRose) {
            sender.roses -= 1;
        }

        // Create like
        const newLike = new Like({
            sender: sender._id,
            receiver: receiverId,
            likedContent,
            comment,
            isRose,
            isSuperLike
        });
        
        await newLike.save();

        // Update behavior metrics
        sender.behaviorMetrics.likesGiven += 1;
        receiver.behaviorMetrics.likesReceived += 1;
        
        await sender.save();

        // Check for mutual like (match)
        const mutualLike = await Like.findOne({ 
            sender: receiverId, 
            receiver: sender._id 
        });

        if (mutualLike) {
            // It's a match!
            sender.matches.push(receiverId);
            receiver.matches.push(sender._id);
            
            // Update behavior metrics
            sender.behaviorMetrics.mutualMatches += 1;
            receiver.behaviorMetrics.mutualMatches += 1;
            
            await Promise.all([sender.save(), receiver.save()]);
            
            // Update like status
            await Like.updateMany(
                { 
                    $or: [
                        { sender: sender._id, receiver: receiverId },
                        { sender: receiverId, receiver: sender._id }
                    ]
                },
                { status: 'matched' }
            );

            // Generate AI ice breaker
            let iceBreaker = null;
            try {
                iceBreaker = await groqAI.generateIceBreaker(sender, receiver, likedContent);
            } catch (error) {
                console.log("Error generating ice breaker:", error);
            }

            // Real-time notification
            const connectedUsers = getConnectedUsers();
            const io = getIO();

            const receiverSocketId = connectedUsers.get(receiverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMatch", {
                    _id: sender._id,
                    name: sender.name,
                    image: sender.images[0],
                    iceBreaker
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                matched: true, 
                user: sender,
                iceBreaker
            });
        }

        // No match yet
        await User.findByIdAndUpdate(receiver._id, {
            $inc: { 'behaviorMetrics.likesReceived': 1 }
        });

        res.status(200).json({ 
            success: true, 
            matched: false, 
            rosesLeft: sender.roses,
            superLikesLeft: sender.superLikesDaily - sender.superLikesUsed
        });
    } catch (error) {
        console.log("Error in sendLike: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getIncomingLikes = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const likes = await Like.find({ 
            receiver: req.user.id, 
            status: 'pending' 
        })
        .populate('sender', 'name age images prompts credibilityScore behaviorIndex job school')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));
        
        res.status(200).json({ success: true, likes });
    } catch (error) {
        console.log("Error in getIncomingLikes: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'matches',
                select: 'name images age job school lastActive onlineStatus',
                options: { sort: { lastActive: -1 } }
            });

        const matchesWithFirstImage = user.matches.map(match => ({
            ...match.toObject(),
            image: match.images && match.images.length > 0 ? match.images[0] : null
        }));

        res.status(200).json({
            success: true,
            matches: matchesWithFirstImage,
        });
    } catch (error) {
        console.log("Error in getMatches: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const likeProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { likedContent, comment } = req.body;
        
        return await sendLike(req, res);
    } catch (error) {
        console.log("Error in likeProfile: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const superLikeProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { likedContent, comment } = req.body;
        
        // Override request body to include super like
        req.body.isSuperLike = true;
        req.params.receiverId = userId;
        
        return await sendLike(req, res);
    } catch (error) {
        console.log("Error in superLikeProfile: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const sendRose = async (req, res) => {
    try {
        const { userId } = req.params;
        const { likedContent, comment } = req.body;
        
        // Override request body to include rose
        req.body.isRose = true;
        req.params.receiverId = userId;
        
        return await sendLike(req, res);
    } catch (error) {
        console.log("Error in sendRose: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const passProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Just mark as passed - no like record needed
        res.status(200).json({ 
            success: true, 
            message: "Profile passed" 
        });
    } catch (error) {
        console.log("Error in passProfile: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const undoLastAction = async (req, res) => {
    try {
        // This would require keeping track of the last action
        // For now, return a premium feature message
        res.status(200).json({ 
            success: true, 
            message: "Undo feature - Premium only" 
        });
    } catch (error) {
        console.log("Error in undoLastAction: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const boostProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.boostCredits < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Not enough boost credits" 
            });
        }

        // Deduct boost credit
        user.boostCredits -= 1;
        await user.save();

        // Boost logic would go here (increase visibility)
        
        res.status(200).json({ 
            success: true, 
            message: "Profile boosted successfully",
            boostCreditsLeft: user.boostCredits
        });
    } catch (error) {
        console.log("Error in boostProfile: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getCompatibilityScore = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(userId);
        
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const score = await matchingAlgorithm.calculateMatchScore(currentUser, targetUser);
        
        res.status(200).json({ 
            success: true, 
            compatibilityScore: score 
        });
    } catch (error) {
        console.log("Error in getCompatibilityScore: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};