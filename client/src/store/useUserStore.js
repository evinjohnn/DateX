import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useUserStore = create((set) => ({
	loading: false,

	updateProfile: async (data) => {
		try {
			set({ loading: true });
			const { session } = useAuthStore.getState();
			
			const { data: updatedUser, error } = await supabase
				.from("profiles")
				.update(data)
				.eq("id", session.user.id)
				.select()
				.single();

			if (error) throw error;
			
			useAuthStore.getState().setAuthUser(updatedUser);
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(error.message || "Something went wrong");
		} finally {
			set({ loading: false });
		}
	},
}));