import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
	messages: [],
	loading: true,
	realtimeChannel: null, // To manage the subscription

	/**
	 * Sends a new message and inserts it into the database.
	 */
	sendMessage: async (receiverId, content) => {
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser || !content.trim()) return;

			// Optimistically update the UI with the new message immediately.
			const optimisticMessage = {
				id: Date.now(), // Temporary ID
				sender_id: authUser.id,
				receiver_id: receiverId,
				content: content.trim(),
				created_at: new Date().toISOString(),
			};
			set((state) => ({ messages: [...state.messages, optimisticMessage] }));

			// Send the message to the database
			const { error } = await supabase.from("messages").insert({
				sender_id: authUser.id,
				receiver_id: receiverId,
				content: content.trim(),
			});

			if (error) {
				// If the DB insert fails, remove the optimistic message
				toast.error("Message failed to send.");
				set((state) => ({
					messages: state.messages.filter((m) => m.id !== optimisticMessage.id),
				}));
				throw error;
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	},

	/**
	 * Fetches the complete conversation history with another user.
	 */
	getMessages: async (otherUserId) => {
		set({ loading: true, messages: [] }); // Reset messages on new chat load
		try {
			const { authUser } = useAuthStore.getState();
			if (!authUser) return;

			const { data, error } = await supabase
				.from("messages")
				.select("*")
				.or(
					`(sender_id.eq.${authUser.id},and(receiver_id.eq.${otherUserId})), (sender_id.eq.${otherUserId},and(receiver_id.eq.${authUser.id}))`,
				)
				.order("created_at", { ascending: true });

			if (error) throw error;
			set({ messages: data });
		} catch (error) {
			console.error("Error getting messages:", error);
			set({ messages: [] });
		} finally {
			set({ loading: false });
		}
	},

	/**
	 * Subscribes to realtime updates for new messages in the current conversation.
	 */
	subscribeToMessages: (otherUserId) => {
		// Ensure we don't have duplicate subscriptions
		get().unsubscribeFromMessages();

		const { authUser } = useAuthStore.getState();
		if (!authUser) return;

		const channel = supabase
			.channel(`public:messages:user=${otherUserId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					// Listen for messages sent to the current user from the other user
					filter: `receiver_id=eq.${authUser.id},and(sender_id.eq.${otherUserId})`,
				},
				(payload) => {
					// Add the new message to the state
					set((state) => ({ messages: [...state.messages, payload.new] }));
				},
			)
			.subscribe();

		set({ realtimeChannel: channel });
	},

	/**
	 * Unsubscribes from the message channel to prevent memory leaks when leaving a chat.
	 */
	unsubscribeFromMessages: () => {
		const { realtimeChannel } = get();
		if (realtimeChannel) {
			supabase.removeChannel(realtimeChannel);
			set({ realtimeChannel: null });
		}
	},
}));