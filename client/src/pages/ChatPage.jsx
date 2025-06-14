import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Header } from "../components/Header";
import { useMatchStore, useMessageStore } from "../store";
import { Link, useParams } from "react-router-dom";
import { Loader, UserX, Phone, Info, Video } from "lucide-react"; // Changed VideoCamera to Video
import MessageInput from "../components/MessageInput";

const ChatPage = () => {
	const { id } = useParams();
	const { match, getMyMatches, isLoadingMyMatches } = useMatchStore((state) => ({
		// Find the match using `id` from profiles, as components expect `_id` but Supabase uses `id`
		match: state.matches.find((m) => m.id === id || m._id === id),
		getMyMatches: state.getMyMatches,
		isLoadingMyMatches: state.isLoadingMyMatches,
	}));

	const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();

	const { authUser } = useAuthStore();
	const messagesEndRef = useRef(null); // Ref to scroll to the bottom

	// Scroll to the latest message whenever messages array updates
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		// If the match data isn't loaded yet, fetch it.
		if (!match) {
			getMyMatches();
		}

		if (id) {
			getMessages(id); // Fetch initial messages for this chat
			subscribeToMessages(id); // Start listening for new messages
		}

		// The cleanup function will be returned by the zustand store action
		return () => {
			unsubscribeFromMessages();
		};
	}, [id, match, getMyMatches, getMessages, subscribeToMessages, unsubscribeFromMessages]);

	if (isLoadingMyMatches) return <LoadingMessagesUI />;

	// A special case for when the page loads but match data isn't ready yet
	if (!match) return <LoadingMessagesUI />;

	// Renaming Supabase's `id` to `_id` for component compatibility
	const compatibleMatch = { ...match, _id: match.id || match._id, image: match.image_url || match.image };

	return (
		<div className='flex flex-col h-screen bg-black'>
			<Header />

			<div className='flex-grow flex flex-col overflow-hidden max-w-4xl mx-auto w-full'>
				{/* Chat Header */}
				<div className='bg-[#FFC629] bg-opacity-95 p-4 rounded-b-2xl shadow-lg'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<img
								src={compatibleMatch.image || "/avatar.png"}
								className='w-12 h-12 object-cover rounded-full border-2 border-white'
								alt={compatibleMatch.name}
							/>
							<div>
								<h2 className='text-xl font-bold text-black'>{compatibleMatch.name}</h2>
								<span className='text-sm text-black opacity-75'>Online</span>
							</div>
						</div>
						<div className='flex items-center space-x-4'>
							<button className='p-2 hover:bg-yellow-400 rounded-full transition-colors'>
								<Phone className='w-6 h-6 text-black' />
							</button>
							<button className='p-2 hover:bg-yellow-400 rounded-full transition-colors'>
								<Video className='w-6 h-6 text-black' />
							</button>
							<button className='p-2 hover:bg-yellow-400 rounded-full transition-colors'>
								<Info className='w-6 h-6 text-black' />
							</button>
						</div>
					</div>
				</div>

				{/* Messages Area */}
				<div className='flex-grow overflow-y-auto p-4 space-y-4'>
					{messages.length === 0 ? (
						<div className='flex flex-col items-center justify-center h-full space-y-4 text-center'>
							<div className='w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center'>
								<img
									src={compatibleMatch.image || "/avatar.png"}
									className='w-20 h-20 rounded-full object-cover'
									alt={compatibleMatch.name}
								/>
							</div>
							<p className='text-gray-400 text-lg'>
								This is the beginning of your conversation with{" "}
								<span className='font-bold text-white'>{compatibleMatch.name}</span>.
							</p>
						</div>
					) : (
						messages.map((msg) => (
							<div
								key={msg.id || msg._id}
								className={`flex ${msg.sender_id === authUser.id ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[75%] p-3 rounded-2xl ${
										msg.sender_id === authUser.id
											? "bg-[#FFC629] text-black rounded-br-none"
											: "bg-gray-800 text-white rounded-bl-none"
									}`}
								>
									<p className='text-sm md:text-base'>{msg.content}</p>
								</div>
							</div>
						))
					)}
					<div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
				</div>

				{/* Message Input Area */}
				<div className='p-4 bg-gray-900/50 backdrop-blur-sm rounded-t-2xl'>
					<MessageInput match={compatibleMatch} />
				</div>
			</div>
		</div>
	);
};

// --- Helper Components ---

const MatchNotFound = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-black'>
		<div className='bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4'>
			<UserX size={64} className='mx-auto text-[#FFC629] mb-4' />
			<h2 className='text-2xl font-bold text-white mb-2'>Match Not Found</h2>
			<p className='text-gray-400 mb-6'>This match doesn't exist or has been removed.</p>
			<Link
				to='/'
				className='px-6 py-3 bg-[#FFC629] text-black font-semibold rounded-xl hover:bg-yellow-400 
                transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
                focus:ring-offset-gray-900 inline-block'
			>
				Back to Swiping
			</Link>
		</div>
	</div>
);

const LoadingMessagesUI = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-black'>
		<div className='bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4'>
			<Loader size={48} className='mx-auto text-[#FFC629] animate-spin mb-4' />
			<h2 className='text-2xl font-bold text-white mb-2'>Loading Chat</h2>
			<p className='text-gray-400'>Please wait while we fetch your conversation...</p>
			<div className='mt-6 flex justify-center space-x-2'>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0s" }}></div>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0.2s" }}></div>
				<div className='w-3 h-3 bg-[#FFC629] rounded-full animate-bounce' style={{ animationDelay: "0.4s" }}></div>
			</div>
		</div>
	</div>
);

export default ChatPage;