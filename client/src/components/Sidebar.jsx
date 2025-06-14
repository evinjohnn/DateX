import { useEffect, useState } from "react";
import { Heart, Loader, MessageCircle, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMatchStore } from "../store/useMatchStore";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();

    useEffect(() => {
        getMyMatches();
    }, [getMyMatches]);

    return (
        <>
            <div 
                className={`
                    fixed inset-y-0 left-0 z-20 w-80 bg-black 
                    shadow-2xl rounded-r-3xl overflow-hidden transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:w-1/4
                `}
            >
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 pb-4 border-b border-yellow-400/20 flex justify-between items-center bg-black/50 backdrop-blur-lg'>
                        <div className="flex items-center space-x-3">
                            <Heart size={32} className="text-yellow-400" />
                            <h2 className='text-2xl font-bold text-yellow-400'>Matches</h2>
                        </div>
                        <button
                            className='lg:hidden p-2 text-gray-400 hover:text-yellow-400 focus:outline-none'
                            onClick={toggleSidebar}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className='flex-grow overflow-y-auto p-4 space-y-3 z-10 relative'>
                        {isLoadingMyMatches ? (
                            <LoadingState />
                        ) : matches.length === 0 ? (
                            <NoMatchesFound />
                        ) : (
                            matches.map((match) => (
                                <Link key={match._id} to={`/chat/${match._id}`}>
                                    <div className='
                                        flex items-center justify-between 
                                        bg-gray-900/50 border border-yellow-400/10 
                                        hover:bg-yellow-400/10 hover:border-yellow-400/30 
                                        p-3 rounded-xl 
                                        transition-all duration-300 
                                        group backdrop-blur-lg
                                    '>
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={match.image || "/avatar.png"}
                                                alt='User avatar'
                                                className='size-12 object-cover rounded-full border-2 border-yellow-400/50'
                                            />
                                            <h3 className='font-semibold text-gray-100 group-hover:text-yellow-400'>{match.name}</h3>
                                        </div>
                                        <ChevronRight 
                                            size={20} 
                                            className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <button
                className='
                    lg:hidden fixed top-4 left-4 
                    p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 
                    text-black rounded-full shadow-lg z-10 
                    hover:scale-110 transition-all
                '
                onClick={toggleSidebar}
            >
                <MessageCircle size={24} />
            </button>
        </>
    );
};

export default Sidebar;

const NoMatchesFound = () => (
    <div className='flex flex-col items-center justify-center h-full text-center space-y-4 p-6 bg-gray-900/50 rounded-2xl border border-yellow-400/10'>
        <Heart className='text-yellow-400 animate-pulse' size={64} />
        <div>
            <h3 className='text-xl font-bold text-gray-100 mb-2'>No Matches Yet</h3>
            <p className='text-gray-400 max-w-xs'>
                Don&apos;t worry! Your perfect match is just around the corner. Keep swiping!
            </p>
        </div>
    </div>
);

const LoadingState = () => (
    <div className='flex flex-col items-center justify-center h-full text-center space-y-4 p-6 bg-gray-900/50 rounded-2xl border border-yellow-400/10'>
        <Loader className='text-yellow-400 mb-4 animate-spin' size={64} />
        <div>
            <h3 className='text-xl font-bold text-gray-100 mb-2'>Loading Matches</h3>
            <p className='text-gray-400 max-w-xs'>
                We&apos;re finding your perfect matches. This might take a moment...
            </p>
        </div>
    </div>
);