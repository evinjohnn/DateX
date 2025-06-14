import { useRef, useState } from "react";
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { authUser } = useAuthStore();
	const { loading, updateProfile } = useUserStore();

	// Initialize state with data from the authenticated user
	const [name, setName] = useState(authUser.name || "");
	const [bio, setBio] = useState(authUser.bio || "");
	const [age, setAge] = useState(authUser.age || "");
	const [gender, setGender] = useState(authUser.gender || "");
	const [genderPreference, setGenderPreference] = useState(authUser.gender_preference || "both");
	const [image, setImage] = useState(authUser.image_url || null); // For display preview
	const [imageFile, setImageFile] = useState(null); // For upload

	const fileInputRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		let finalImageUrl = authUser.image_url;

		if (imageFile) {
			// Prevent duplicate uploads if user re-submits without changing image
			const fileName = `${authUser.id}-${Date.now()}`;

			// Upload new image to Supabase storage
			const { data, error } = await supabase.storage.from("avatars").upload(fileName, imageFile);

			if (error) {
				toast.error("Image upload failed: " + error.message);
				return;
			}

			// Get public URL for the newly uploaded file
			const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path);
			finalImageUrl = publicUrl;
		}

		const profileData = {
			name,
			bio,
			age,
			gender,
			gender_preference: genderPreference,
			image_url: finalImageUrl,
		};

		await updateProfile(profileData);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result); // Set local preview URL
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='min-h-screen bg-black text-white'>
			<Header />

			<div className='flex-grow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-md'>
					<h2 className='text-center text-3xl font-bold text-yellow-400'>Edit Profile</h2>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
					<div className='bg-gray-900 py-8 px-4 shadow-xl shadow-black/20 sm:rounded-2xl sm:px-10 border border-yellow-400/20'>
						<form onSubmit={handleSubmit} className='space-y-6'>
							{/* Image Upload */}
							<div className='flex flex-col items-center space-y-4'>
								<div className='relative group'>
									<div className='w-32 h-32 rounded-full overflow-hidden border-2 border-yellow-400/50 relative'>
										<img
											src={image || "/avatar.png"}
											alt='Profile'
											className='w-full h-full object-cover'
										/>
										<div
											className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                            transition-opacity flex items-center justify-center cursor-pointer'
											onClick={() => fileInputRef.current.click()}
										>
											<Camera className='text-yellow-400' size={24} />
										</div>
									</div>
									<input
										ref={fileInputRef}
										type='file'
										accept='image/*'
										className='hidden'
										onChange={handleImageChange}
									/>
								</div>
							</div>

							{/* Name */}
							<div>
								<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
									Name
								</label>
								<input
									id='name'
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                                    text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
								/>
							</div>

							{/* Age */}
							<div>
								<label htmlFor='age' className='block text-sm font-medium text-gray-300'>
									Age
								</label>
								<input
									id='age'
									type='number'
									required
									min='18'
									value={age}
									onChange={(e) => setAge(e.target.value)}
									className='mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                                    text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
								/>
							</div>

							{/* Gender */}
							<div>
								<span className='block text-sm font-medium text-gray-300 mb-2'>Gender</span>
								<div className='flex space-x-4'>
									{["Male", "Female"].map((option) => (
										<label key={option} className='relative flex items-center'>
											<input
												type='radio'
												className='sr-only'
												name='gender'
												value={option.toLowerCase()}
												checked={gender === option.toLowerCase()}
												onChange={() => setGender(option.toLowerCase())}
											/>
											<div
												className={`
                                                px-4 py-2 rounded-full border cursor-pointer transition-all
                                                ${
																									gender === option.toLowerCase()
																										? "bg-yellow-400 text-black border-yellow-400"
																										: "border-gray-600 text-gray-300 hover:border-yellow-400/50"
																								}
                                            `}
											>
												{option}
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Gender Preference */}
							<div>
								<span className='block text-sm font-medium text-gray-300 mb-2'>Show Me</span>
								<div className='flex space-x-4'>
									{["Male", "Female", "Both"].map((option) => (
										<label key={option} className='relative flex items-center'>
											<input
												type='radio'
												className='sr-only'
												name='preference'
												checked={genderPreference === option.toLowerCase()}
												onChange={() => setGenderPreference(option.toLowerCase())}
											/>
											<div
												className={`
                                                px-4 py-2 rounded-full border cursor-pointer transition-all
                                                ${
																									genderPreference === option.toLowerCase()
																										? "bg-yellow-400 text-black border-yellow-400"
																										: "border-gray-600 text-gray-300 hover:border-yellow-400/50"
																								}
                                            `}
											>
												{option}
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Bio */}
							<div>
								<label htmlFor='bio' className='block text-sm font-medium text-gray-300'>
									Bio
								</label>
								<textarea
									id='bio'
									rows={4}
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className='mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                                    text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                    resize-none'
								/>
							</div>

							<button
								type='submit'
								className='w-full flex justify-center items-center gap-2 py-3 px-4 
                                bg-gradient-to-r from-yellow-400 to-yellow-500
                                rounded-xl text-black font-semibold shadow-lg
                                hover:from-yellow-500 hover:to-yellow-600 
                                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
                                focus:ring-offset-gray-900 transition-all disabled:opacity-50'
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className='animate-spin' size={20} />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;