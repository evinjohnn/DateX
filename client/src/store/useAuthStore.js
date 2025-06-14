import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
	authUser: null,
	session: null,
	loading: false,

	// No need for checkingAuth, onAuthStateChange handles it
	initializeAuth: () => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (session) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", session.user.id)
					.single();
				set({ authUser: profile, session });
			} else {
				set({ authUser: null, session: null });
			}
		});

		// Fetch initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				supabase.from("profiles")
					.select("*")
					.eq("id", session.user.id)
					.single()
					.then(({ data: profile }) => {
						set({ authUser: profile, session });
					});
			}
		});

		return () => subscription.unsubscribe();
	},

	signup: async (signupData) => {
		try {
			set({ loading: true });
			const { name, email, password, age, gender, genderPreference } = signupData;

			const { data, error } = await supabase.auth.signUp({ email, password });
			if (error) throw error;
			
			// Insert profile after auth user is created
			const { error: profileError } = await supabase.from("profiles").insert({
				id: data.user.id,
				name, age, gender, gender_preference: genderPreference,
			});
			if (profileError) throw profileError;

			toast.success("Account created! Check your email to verify.");
		} catch (error) {
			toast.error(error.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},
	login: async (loginData) => {
		try {
			set({ loading: true });
			const { error } = await supabase.auth.signInWithPassword(loginData);
			if (error) throw error;
			toast.success("Logged in successfully");
		} catch (error) {
			toast.error(error.message || "Invalid credentials");
		} finally {
			set({ loading: false });
		}
	},
	logout: async () => {
		try {
			await supabase.auth.signOut();
			set({ authUser: null, session: null });
		} catch (error) {
			toast.error(error.message || "Something went wrong");
		}
	},
	setAuthUser: (user) => set({ authUser: user }),
}));