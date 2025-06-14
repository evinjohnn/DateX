import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";
import { MapPin, Briefcase, GraduationCap } from "lucide-react";

const SwipeArea = () => {
    const { userProfiles, swipeRight, swipeLeft } = useMatchStore();

    const handleSwipe = (dir, user) => {
        if (dir === "right") swipeRight(user);
        else if (dir === "left") swipeLeft(user);
    };

    return (
        <div className='relative w-full max-w-sm h-[32rem]'>
            {userProfiles.map((user) => (
                <TinderCard
                    className='absolute'
                    key={user._id}
                    onSwipe={(dir) => handleSwipe(dir, user)}
                    swipeRequirementType='position'
                    swipeThreshold={100}
                    preventSwipe={["up", "down"]}
                >
                    <div className='
                        w-96 h-[32rem] select-none rounded-3xl overflow-hidden
                        bg-gradient-to-b from-gray-900 to-black
                        border border-yellow-400/20
                        shadow-xl shadow-black/20
                        transform transition-transform duration-300 hover:scale-[1.02]
                    '>
                        <div className='relative h-4/5'>
                            <img
                                src={user.image || "/avatar.png"}
                                alt={user.name}
                                className='w-full h-full object-cover pointer-events-none'
                            />
                            {/* Gradient overlay */}
                            <div className='
                                absolute inset-0 bg-gradient-to-b 
                                from-black/10 via-transparent to-black/90
                            '/>
                            
                            {/* User info overlay */}
                            <div className='
                                absolute bottom-0 left-0 right-0 p-6
                                text-white backdrop-blur-sm
                            '>
                                <div className='flex items-end gap-3'>
                                    <h2 className='text-3xl font-bold'>
                                        {user.name}
                                    </h2>
                                    <span className='text-2xl font-medium text-yellow-400'>
                                        {user.age}
                                    </span>
                                </div>
                                
                                {/* User details with icons */}
                                <div className='mt-3 space-y-2 text-gray-200'>
                                    {user.location && (
                                        <div className='flex items-center gap-2'>
                                            <MapPin size={18} className='text-yellow-400' />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    {user.occupation && (
                                        <div className='flex items-center gap-2'>
                                            <Briefcase size={18} className='text-yellow-400' />
                                            <span>{user.occupation}</span>
                                        </div>
                                    )}
                                    {user.education && (
                                        <div className='flex items-center gap-2'>
                                            <GraduationCap size={18} className='text-yellow-400' />
                                            <span>{user.education}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio section */}
                        <div className='
                            p-6 h-1/5 bg-black/90
                            border-t border-yellow-400/20 backdrop-blur-lg
                        '>
                            <p className='text-gray-300 text-sm line-clamp-3'>
                                {user.bio}
                            </p>
                        </div>
                    </div>
                </TinderCard>
            ))}
        </div>
    );
};

export default SwipeArea;