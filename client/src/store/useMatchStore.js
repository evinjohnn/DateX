import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useMatchStore = create((set, get) => ({
	// =================================================================
	// STATE
	// =================================================================
	matches: [], // Profiles of users we have matched with
	userProfiles: [], // Profiles of users available to swipe on
	isLoadingMyMatches: false,
	isLoadingUserProfiles: false,
	swipeFeedback: null, // 'liked', 'passed', 'matched', or null
	realtimeChannel: null, // To hold the realtime subscription channel

	// =================================================================
	// ACTIONS
	// =================================================================

	/**
	 * Fetches profiles for the current user to swipe on.
	 * It excludes the current user, anyone they've already swiped on,
	 * and filters based on mutual gender preferences.
	 */
	getUserProfiles: async () => {
		set({ isLoadingUserProfiles: true });
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser) return;

			// Get IDs of users the current user has already liked or disliked
			const { data: likesData, error: likesError } = await supabase
				.from("likes")
				.select("liked_user_id")
				.eq("user_id", authUser.id);
			if (likesError) throw likesError;

			const { data: dislikesData, error: dislikesError } = await supabase
				.from("dislikes")
				.select("disliked_user_id")
				.eq("user_id", authUser.id);
			if (dislikesError) throw dislikesError;

			const likedIds = likesData.map((l) => l.liked_user_id);
			const dislikedIds = dislikesData.map((d) => d.disliked_user_id);
			const interactedIds = [...new Set([...likedIds, ...dislikedIds, authUser.id])];

			// Base query to get profiles that haven't been interacted with
			let query = supabase.from("profiles").select("*").not("id", "in", `(${interactedIds.join(",")})`);

			// Filter by the current user's preference
			if (authUser.gender_preference !== "both") {
				query = query.eq("gender", authUser.gender_preference);
			}

			const { data: potentialProfiles, error: profilesError } = await query;
			if (profilesError) throw profilesError;

			// Client-side filter: only show users who are interested in our gender
			const finalProfiles = potentialProfiles.filter(
				(profile) => profile.gender_preference === "both" || profile.gender_preference === authUser.gender,
			);

			set({ userProfiles: finalProfiles });
		} catch (error) {
			console.error("Error fetching user profiles:", error);
			toast.error("Could not load new profiles.");
			set({ userProfiles: [] });
		} finally {
			set({ isLoadingUserProfiles: false });
		}
	},

	/**
	 * Handles a "swipe left" action, recording it in the database.
	 */
	swipeLeft: async (user) => {
		set({ swipeFeedback: "passed" });
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser) return;

			// Optimistic UI update: Remove the user from the swipe queue immediately.
			set((state) => ({
				userProfiles: state.userProfiles.filter((p) => p.id !== user.id),
			}));

			await supabase.from("dislikes").insert({ user_id: authUser.id, disliked_user_id: user.id });
		} catch (error) {
			console.error("Error swiping left:", error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setTimeout(() => set({ swipeFeedback: null }), 1000); // Reset feedback animation
		}
	},

	/**
	 * Handles a "swipe right" action, records it, and checks for a match.
	 */
	swipeRight: async (user) => {
		set({ swipeFeedback: "liked" });
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser) return;

			// Optimistic UI update
			set((state) => ({
				userProfiles: state.userProfiles.filter((p) => p.id !== user.id),
			}));

			// Record the like
			await supabase.from("likes").insert({ user_id: authUser.id, liked_user_id: user.id });

			// Check if the other user has already liked us (check for a match)
			const { data: matchCheck, error: matchCheckError } = await supabase
				.from("likes")
				.select("id")
				.eq("user_id", user.id)
				.eq("liked_user_id", authUser.id)
				.single();

			if (matchCheckError && matchCheckError.code !== "PGRST116") {
				// PGRST116 (No rows found) is expected if it's not a match, so we ignore it.
				throw matchCheckError;
			}

			if (matchCheck) {
				// It's a match!
				set({ swipeFeedback: "matched" });
				await supabase.from("matches").insert([
					{ user1_id: authUser.id, user2_id: user.id },
					{ user1_id: user.id, user2_id: authUser.id }, // Insert both ways for easier queries
				]);
				// The realtime subscription will add the profile to the `matches` list.
			}
		} catch (error) {
			console.error("Error swiping right:", error);
			toast.error("An error occurred. Please try again.");
		} finally {
			// A longer timeout for a match allows the user to see the feedback.
			const timeout = get().swipeFeedback === "matched" ? 2500 : 1000;
			setTimeout(() => set({ swipeFeedback: null }), timeout);
		}
	},

	/**
	 * Fetches the list of users the current user has matched with.
	 */
	getMyMatches: async () => {
		set({ isLoadingMyMatches: true });
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser) return;

			const { data: matchData, error: matchError } = await supabase
				.from("matches")
				.select("user1_id, user2_id")
				.or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`);

			if (matchError) throw matchError;

			const matchedUserIds = [...new Set(matchData.map((m) => (m.user1_id === authUser.id ? m.user2_id : m.user1_id)))];

			if (matchedUserIds.length === 0) {
				set({ matches: [] });
				return;
			}

			const { data: profiles, error: profileError } = await supabase
				.from("profiles")
				.select("id, name, image_url")
				.in("id", matchedUserIds);

			if (profileError) throw profileError;

			// Format data to match component expectations (_id, image)
			const formattedProfiles = profiles.map((p) => ({ ...p, _id: p.id, image: p.image_url }));

			set({ matches: formattedProfiles });
		} catch (error) {
			console.error("Error getting matches:", error);
			toast.error("Could not load your matches.");
			set({ matches: [] });
		} finally {
			set({ isLoadingMyMatches: false });
		}
	},

	// =================================================================
	// REALTIME SUBSCRIPTIONS
	// =================================================================

	/**
	 * Subscribes to realtime updates for new matches.
	 */
	subscribeToNewMatches: () => {
		const { authUser } = useAuthStore.getState();
		if (!authUser) return;

		get().unsubscribeFromNewMatches(); // Ensure no duplicate channels

		const channel = supabase
			.channel("public:matches")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "matches",
					filter: `user2_id=eq.${authUser.id}`, // Listen for when we are the second user in a new match
				},
				async (payload) => {
					const matchedUserId = payload.new.user1_id;

					// Fetch the new match's profile
					const { data: profile } = await supabase
						.from("profiles")
						.select("id, name, image_url")
						.eq("id", matchedUserId)
						.single();

					if (profile) {
						// Format and add to local state
						const formattedProfile = { ...profile, _id: profile.id, image: profile.image_url };
						set((state) => ({ matches: [...state.matches, formattedProfile] }));
						toast.success(`You matched with ${profile.name}!`);
					}
				},
			)
			.subscribe();

		set({ realtimeChannel: channel });
	},

	/**
	 * Unsubscribes from the realtime channel to prevent memory leaks.
	 */
	unsubscribeFromNewMatches: () => {
		const { realtimeChannel } = get();
		if (realtimeChannel) {
			supabase.removeChannel(realtimeChannel);
			set({ realtimeChannel: null });
		}
	},
}));