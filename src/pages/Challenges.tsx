import { useState } from 'react';
import { Trophy, Zap, Users, Clock, ArrowRight, Sparkles, Lock, CheckCircle2, Star, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Challenge {
    id: number;
    title: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    participants: number;
    points: number;
    timeLimit: string;
    description: string;
    status: 'Available' | 'In Progress' | 'Completed' | 'Locked';
    progress?: number;
    icon: any;
}

const challenges: Challenge[] = [
    {
        id: 1,
        title: 'Quick Math Quiz',
        category: 'Mathematics',
        difficulty: 'Beginner',
        participants: 2340,
        points: 100,
        timeLimit: '10 min',
        description: 'Test your basic arithmetic skills with 10 quick questions',
        status: 'Available',
        progress: 0,
        icon: '📐'
    },
    {
        id: 2,
        title: 'Science Explorer',
        category: 'Science',
        difficulty: 'Intermediate',
        participants: 1840,
        points: 250,
        timeLimit: '20 min',
        description: 'Explore fascinating science facts and concepts',
        status: 'Available',
        progress: 0,
        icon: '🧬'
    },
    {
        id: 3,
        title: 'Code Challenge Level 1',
        category: 'Coding',
        difficulty: 'Beginner',
        participants: 1200,
        points: 150,
        timeLimit: '15 min',
        description: 'Simple coding problems to get started',
        status: 'Available',
        progress: 0,
        icon: '💻'
    },
    {
        id: 4,
        title: 'English Grammar Master',
        category: 'English',
        difficulty: 'Intermediate',
        participants: 980,
        points: 200,
        timeLimit: '15 min',
        description: 'Improve your grammar and writing skills',
        status: 'In Progress',
        progress: 60,
        icon: '📚'
    },
    {
        id: 5,
        title: 'Art & Creativity Sprint',
        category: 'Arts',
        difficulty: 'Advanced',
        participants: 450,
        points: 500,
        timeLimit: '30 min',
        description: 'Creative challenges to express your artistic skills',
        status: 'In Progress',
        progress: 40,
        icon: '🎨'
    },
    {
        id: 6,
        title: 'Social Studies Quest',
        category: 'Social Studies',
        difficulty: 'Intermediate',
        participants: 560,
        points: 300,
        timeLimit: '25 min',
        description: 'Journey through history and geography',
        status: 'Available',
        progress: 0,
        icon: '🌍'
    },
    {
        id: 7,
        title: 'Speed Reading Championship',
        category: 'English',
        difficulty: 'Advanced',
        participants: 340,
        points: 400,
        timeLimit: '20 min',
        description: 'Read faster and retain more information',
        status: 'Locked',
        progress: 0,
        icon: '⚡'
    },
    {
        id: 8,
        title: 'Physics Puzzle',
        category: 'Science',
        difficulty: 'Advanced',
        participants: 280,
        points: 450,
        timeLimit: '25 min',
        description: 'Solve complex physics problems and scenarios',
        status: 'Completed',
        progress: 100,
        icon: '⚛️'
    }
];

const categories = ['All', 'Mathematics', 'Science', 'Coding', 'English', 'Arts', 'Social Studies'];

const difficultyColors = {
    'Beginner': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Intermediate': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Advanced': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};

const statusColors = {
    'Available': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700' },
    'Completed': { bg: 'bg-green-50', text: 'text-green-700' },
    'Locked': { bg: 'bg-gray-50', text: 'text-gray-700' }
};

export function ChallengesPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('All');

    const filteredChallenges = challenges.filter(c => {
        const categoryMatch = selectedCategory === 'All' || c.category === selectedCategory;
        const searchMatch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const difficultyMatch = filterDifficulty === 'All' || c.difficulty === filterDifficulty;
        return categoryMatch && searchMatch && difficultyMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-200"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-600 rounded-xl text-white">
                        <Trophy size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Learning Challenges</h1>
                        <p className="text-gray-600 mt-1">Boost your skills and earn points by completing challenges</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    {[
                        { icon: Trophy, label: 'Total Points', value: '2,450', color: 'text-yellow-600' },
                        { icon: Zap, label: 'Streak', value: '12 days', color: 'text-orange-600' },
                        { icon: CheckCircle2, label: 'Completed', value: '8 challenges', color: 'text-green-600' },
                        { icon: Star, label: 'Rank', value: 'Top 5%', color: 'text-purple-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-4 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <stat.icon className={`${stat.color}`} size={24} />
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search challenges..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option>All</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <motion.button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge, idx) => {
                    const isLocked = challenge.status === 'Locked';
                    const colors = difficultyColors[challenge.difficulty];

                    return (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={!isLocked ? { y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
                            className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                                isLocked
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                        >
                            {/* Locked Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-10">
                                    <div className="text-center">
                                        <Lock className="text-white mb-2 mx-auto" size={32} />
                                        <p className="text-white font-semibold">Locked</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{challenge.icon}</div>
                                    <motion.div
                                        className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-bold border ${colors.border}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {challenge.difficulty}
                                    </motion.div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{challenge.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Users size={16} className="text-blue-600" />
                                        <span>{challenge.participants.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock size={16} className="text-amber-600" />
                                        <span>{challenge.timeLimit}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Zap size={16} className="text-purple-600" />
                                        <span>{challenge.points} pts</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[challenge.status].bg} ${statusColors[challenge.status].text}`}>
                                            {challenge.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {challenge.progress !== undefined && challenge.progress > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{challenge.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${challenge.progress}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <motion.button
                                    whileHover={!isLocked ? { scale: 1.02 } : {}}
                                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                                    disabled={isLocked}
                                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                        isLocked
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : challenge.status === 'Completed'
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {challenge.status === 'Completed' ? (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Completed
                                        </>
                                    ) : isLocked ? (
                                        <>
                                            <Lock size={18} />
                                            Locked
                                        </>
                                    ) : (
                                        <>
                                            Start Challenge
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredChallenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gray-50 rounded-2xl"
                >
                    <Sparkles className="mx-auto text-gray-400 mb-4" size={40} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </motion.div>
            )}
        </div>
    );
}
