import { supabase } from "../config/supabase.js";

export const swipeRight = async (req, res) => {
	const { likedUserId } = req.params;
	const currentUserId = req.user.id;

	try {
		// 1. Record the "like"
		const { error: likeError } = await supabase
			.from("likes")
			.insert({ user_id: currentUserId, liked_user_id: likedUserId });
		
		if (likeError && likeError.code !== '23505') { // 23505 is unique violation, we can ignore
			throw likeError;
		}

		// 2. Check if the other user has already liked us (a match)
		const { data: theyLikedUs, error: checkError } = await supabase
			.from("likes")
			.select("*")
			.eq("user_id", likedUserId)
			.eq("liked_user_id", currentUserId)
			.single();
		
		if (checkError && checkError.code !== 'PGRST116') { // PGRST116: no rows returned
			throw checkError;
		}

		if (theyLikedUs) {
			// It's a match!
			const { error: matchError } = await supabase.from("matches").insert([
				{ user1_id: currentUserId, user2_id: likedUserId },
				{ user1_id: likedUserId, user2_id: currentUserId }, // insert both ways for easier querying
			]);

			if (matchError) {
				console.log("Match insert error (might be duplicate): ", matchError.message);
			}
		}

		res.status(200).json({ success: true, isMatch: !!theyLikedUs });
	} catch (error) {
		console.log("Error in swipeRight: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const swipeLeft = async (req, res) => {
	const { dislikedUserId } = req.params;
	const currentUserId = req.user.id;
	try {
		await supabase.from("dislikes").insert({ user_id: currentUserId, disliked_user_id: dislikedUserId });
		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in swipeLeft: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getMatches = async (req, res) => {
	const currentUserId = req.user.id;
	try {
		const { data: matchData, error } = await supabase
			.from("matches")
			.select("user1_id, user2_id")
			.or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

		if (error) throw error;
		
		const matchedUserIds = matchData
			.map(m => m.user1_id === currentUserId ? m.user2_id : m.user1_id)
			.filter(id => id !== currentUserId);

		if(matchedUserIds.length === 0) return res.status(200).json({ matches: [] });

		const { data: profiles, error: profileError } = await supabase
			.from("profiles")
			.select("id, name, image_url")
			.in("id", matchedUserIds);
		
		if (profileError) throw profileError;

		res.status(200).json({ matches: profiles });
	} catch (error) {
		console.log("Error in getMatches: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getUserProfiles = async (req, res) => {
	const currentUser = req.user;
	
	try {
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', currentUser.id)
			.single();
		
		if (profileError) throw profileError;

		// Get IDs of users already interacted with
		const { data: likes } = await supabase.from('likes').select('liked_user_id').eq('user_id', currentUser.id);
		const { data: dislikes } = await supabase.from('dislikes').select('disliked_user_id').eq('user_id', currentUser.id);
		
		const likedIds = likes.map(l => l.liked_user_id);
		const dislikedIds = dislikes.map(d => d.disliked_user_id);
		const interactedIds = [...likedIds, ...dislikedIds, currentUser.id];
		
		let query = supabase
			.from('profiles')
			.select('*')
			.not('id', 'in', `(${interactedIds.join(',')})`);

		// Filter by gender preference
		if (profile.gender_preference !== 'both') {
			query = query.eq('gender', profile.gender_preference);
		}

		const { data: users, error } = await query;
		
		if (error) throw error;
		
		const finalUsers = users.filter(u => u.gender_preference === 'both' || u.gender_preference === profile.gender);

		res.status(200).json({ users: finalUsers });
	} catch (error) {
		console.log("Error in getUserProfiles: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};