import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Configure dotenv to find the .env file in the root directory
dotenv.config({ path: "../../.env" });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
	throw new Error("Supabase URL or Service Key is missing in .env file");
}

// Create an admin client to bypass RLS for seeding
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// --- Data for Seeding ---

const maleNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas"];

const femaleNames = [
	"Mary",
	"Patricia",
	"Jennifer",
	"Linda",
	"Elizabeth",
	"Barbara",
	"Susan",
	"Jessica",
	"Sarah",
	"Karen",
	"Nancy",
	"Lisa",
];

const genderPreferences = ["male", "female", "both"];

const bioDescriptors = [
	"Coffee addict",
	"Cat lover",
	"Dog person",
	"Foodie",
	"Gym rat",
	"Bookworm",
	"Movie buff",
	"Music lover",
	"Travel junkie",
	"Beach bum",
	"City slicker",
	"Outdoor enthusiast",
	"Netflix binger",
	"Yoga enthusiast",
	"Craft beer connoisseur",
	"Sushi fanatic",
	"Adventure seeker",
	"Night owl",
	"Early bird",
	"Aspiring chef",
];

// --- Helper Functions ---

const generateBio = () => {
	// Shuffle and pick 3 random descriptors
	const descriptors = bioDescriptors.sort(() => 0.5 - Math.random()).slice(0, 3);
	return descriptors.join(" | ");
};

const generateRandomUser = (gender, index) => {
	const names = gender === "male" ? maleNames : femaleNames;
	const name = names[index % names.length]; // Use modulo to prevent out-of-bounds
	const age = Math.floor(Math.random() * (45 - 18 + 1) + 18); // Ages 18-45
	return {
		name,
		email: `${name.toLowerCase()}${age}@example.com`,
		password: "password123", // Use a simple password for seeding
		age,
		gender,
		gender_preference: genderPreferences[Math.floor(Math.random() * genderPreferences.length)],
		bio: generateBio(),
		image_url: `https://raw.githubusercontent.com/evinjohnn/tinder_clone/main/client/public/${gender}/${
			(index % (gender === "male" ? 9 : 12)) + 1 // Cycle through available images
		}.jpg`,
	};
};

// --- Main Seeding Logic ---

async function seedUsers() {
	try {
		// 1. Clean up existing data
		console.log("Cleaning up existing data...");
		const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
		if (usersError) throw usersError;

		for (const user of users.users) {
			// Deleting an auth user will also delete the corresponding profile
			// because of the "ON DELETE CASCADE" constraint we set up in SQL.
			const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
			if (deleteError) {
				console.warn(`Could not delete user ${user.email}: ${deleteError.message}`);
			}
		}
		console.log("Cleanup complete.");

		// 2. Generate new users
		console.log("Generating new users...");
		const maleUsers = maleNames.map((_, i) => generateRandomUser("male", i));
		const femaleUsers = femaleNames.map((_, i) => generateRandomUser("female", i));
		const allUsersToSeed = [...maleUsers, ...femaleUsers];

		// 3. Insert new users
		console.log(`Starting to seed ${allUsersToSeed.length} users...`);
		for (const user of allUsersToSeed) {
			// Create the user in Supabase Auth
			const { data: authData, error: authError } = await supabase.auth.admin.createUser({
				email: user.email,
				password: user.password,
				email_confirm: true, // Auto-confirm email for seeded users
			});

			if (authError) {
				console.error(`Error creating auth user for ${user.email}:`, authError.message);
				continue; // Skip to the next user
			}

			// Insert the corresponding profile data
			const { error: profileError } = await supabase.from("profiles").insert({
				id: authData.user.id,
				name: user.name,
				age: user.age,
				gender: user.gender,
				gender_preference: user.gender_preference,
				bio: user.bio,
				image_url: user.image_url,
			});

			if (profileError) {
				console.error(`Error creating profile for ${user.email}:`, profileError.message);
			} else {
				console.log(`Successfully seeded user: ${user.email}`);
			}
		}

		console.log("Seeding complete!");
	} catch (error) {
		console.error("An unexpected error occurred during seeding:", error);
	}
}

// Run the seed function
seedUsers();