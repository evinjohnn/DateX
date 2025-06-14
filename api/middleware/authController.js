import { supabase } from "../config/supabase.js";

export const signup = async (req, res) => {
	const { name, email, password, age, gender, genderPreference } = req.body;

	if (!name || !email || !password || !age || !gender || !genderPreference) {
		return res.status(400).json({ message: "All fields are required" });
	}
	if (age < 18) {
		return res.status(400).json({ message: "You must be at least 18 years old" });
	}

	try {
		// 1. Create the user in Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (authError) throw authError;
		if (!authData.user) throw new Error("Signup failed, no user returned");

		// 2. Insert the user profile into the public 'profiles' table
		const { data: profileData, error: profileError } = await supabase
			.from("profiles")
			.insert({
				id: authData.user.id,
				name,
				age,
				gender,
				gender_preference: genderPreference,
			})
			.select()
			.single();

		if (profileError) throw profileError;

		res.status(201).json({ user: profileData, session: authData.session });
	} catch (error) {
		console.log("Error in signup controller:", error);
		res.status(500).json({ message: error.message || "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "Email and password are required" });
	}

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;
		
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", data.user.id)
			.single();

		if (profileError) throw profileError;
		
		res.status(200).json({ user: profile, session: data.session });
	} catch (error) {
		console.log("Error in login controller:", error);
		res.status(401).json({ message: error.message || "Invalid credentials" });
	}
};

export const logout = async (req, res) => {
	const { error } = await supabase.auth.signOut();
	if (error) {
		return res.status(500).json({ message: "Logout failed" });
	}
	res.status(200).json({ message: "Logged out successfully" });
};

// This function will get the user from the JWT sent by the client
export const getMe = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) return res.status(500).json({ message: "Could not fetch profile" });

    res.json({ user: profile });
};