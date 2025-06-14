import { supabase } from "../config/supabase.js";

// A small middleware to get the user from the token for protected routes
export const getUserFromToken = async (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).json({ message: "No token provided" });

	const { data: { user }, error } = await supabase.auth.getUser(token);
	if (error) return res.status(401).json({ message: "Invalid token" });
	
	req.user = user;
	next();
};


export const updateProfile = async (req, res) => {
	const { name, bio, age, gender, genderPreference, imageUrl } = req.body;
	const userId = req.user.id;

	const updatedData = { name, bio, age, gender, gender_preference: genderPreference };
	if (imageUrl) {
		updatedData.image_url = imageUrl;
	}

	try {
		const { data, error } = await supabase
			.from("profiles")
			.update(updatedData)
			.eq("id", userId)
			.select()
			.single();

		if (error) throw error;

		res.status(200).json({ user: data });
	} catch (error) {
		console.log("Error in updateProfile: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};