import { supabase } from "../config/supabase.js";

export const sendMessage = async (req, res) => {
	const { content, receiverId } = req.body;
	const senderId = req.user.id;
	try {
		const { data, error } = await supabase
			.from("messages")
			.insert({
				sender_id: senderId,
				receiver_id: receiverId,
				content,
			})
			.select()
			.single();

		if (error) throw error;
		res.status(201).json({ message: data });
	} catch (error) {
		console.log("Error in sendMessage: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getConversation = async (req, res) => {
	const { userId: otherUserId } = req.params;
	const currentUserId = req.user.id;
	try {
		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.or(`(sender_id.eq.${currentUserId},and(receiver_id.eq.${otherUserId})), (sender_id.eq.${otherUserId},and(receiver_id.eq.${currentUserId}))`)
			.order("created_at", { ascending: true });

		if (error) throw error;
		res.status(200).json({ messages: data });
	} catch (error) {
		console.log("Error in getConversation: ", error);
		res.status(500).json({ message: "Internal server error" });
	}
};