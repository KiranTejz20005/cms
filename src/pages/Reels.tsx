import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Video, Upload, X, PlusCircle, Map, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types & Mock Data ---

const GRADES = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);

const SUBJECTS = [
    { name: 'Mathematics', color: 'bg-blue-100 text-blue-600', icon: '📐' },
    { name: 'Science', color: 'bg-green-100 text-green-600', icon: '🧬' },
    { name: 'English', color: 'bg-yellow-100 text-yellow-600', icon: '📚' },
    { name: 'Social Studies', color: 'bg-orange-100 text-orange-600', icon: '🌍' },
    { name: 'Coding', color: 'bg-purple-100 text-purple-600', icon: '💻' },
    { name: 'Art', color: 'bg-pink-100 text-pink-600', icon: '🎨' },
];

const TABS = ['Videos', 'Learning Paths', 'Modules'];

// Generate ~50-100 mock items dynamically
const MOCK_CONTENT = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    title: `Lesson ${i + 1}: ${i === 0 ? 'Introduction to Logic (Sample)' : 'Advanced Concepts'}`,
    type: 'Video',
    duration: '5:00',
    thumbnail: `bg-${['blue', 'green', 'indigo', 'purple', 'pink', 'orange'][i % 6]}-100`,
    // Use the user provided sample for the first item, placeholders for others
    videoUrl: i === 0
        ? "https://www.youtube.com/embed/VScM8Z8Jls0?si=YKwMYw9zO8FAvcpB"
        : "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
}));

export function ReelsPage() {
    // Navigation State
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Videos');

    // Data State
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Video Player State
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    // Upload State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Data on Selection Change
    useEffect(() => {
        if (selectedGrade && selectedSubject) {
            fetchContent();
        } else {
            setItems([]);
        }
    }, [selectedGrade, selectedSubject, activeTab]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { strapiApi } = await import('../lib/strapi');

            // Map tab to type
            const typeFilter = activeTab === 'Videos' ? 'Video' : (activeTab === 'Learning Paths' ? 'Course' : 'Article');

            const data = await strapiApi.find('contents', {
                filters: {
                    grade: { $eq: selectedGrade },
                    category: { $eq: selectedSubject }, // Mapping Subject -> Category
                    type: { $eq: typeFilter }
                },
                populate: '*',
                sort: ['createdAt:desc']
            });

            if (data && data.data && data.data.length > 0) {
                const normalized = data.data.map((item: any) => ({
                    id: item.id,
                    title: item.attributes.title,
                    type: item.attributes.type,
                    duration: '5:00', // Placeholder as Strapi doesn't explicitly store duration yet
                    thumbnail: 'bg-gray-100', // Placeholder
                    videoUrl: item.attributes.media?.data?.attributes?.url || null,
                    progress: Math.floor(Math.random() * 100) // Mock progress
                }));
                setItems(normalized);
            } else {
                // Fallback to Mock if empty
                console.log("No data found in Strapi, using mock data for demo.");
                setItems(MOCK_CONTENT);
            }
        } catch (error) {
            console.error("Failed to fetch reels:", error);
            setItems(MOCK_CONTENT); // Fallback on error
        } finally {
            setLoading(false);
        }
    };;

    // --- Handlers ---
    const handleGradeSelect = (grade: string) => setSelectedGrade(grade);
    const handleSubjectSelect = (subject: string) => setSelectedSubject(subject);
    const goBack = () => {
        if (selectedSubject) setSelectedSubject(null);
        else if (selectedGrade) setSelectedGrade(null);
    };

    const handleBulkUpload = async () => {
        if (!files || files.length === 0) return;
        setUploading(true);

        try {
            const { strapiApi } = await import('../lib/strapi');

            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('files', file);

                // 1. Upload Media
                const uploadRes = await strapiApi.upload(formData);
                const fileId = uploadRes[0].id;

                // 2. Create Content Entry
                await strapiApi.create('contents', {
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    type: 'Video',
                    grade: selectedGrade || 'Grade 1',
                    category: selectedSubject || 'General',
                    media: fileId,
                    modules: 1
                });
            }

            alert(`Successfully uploaded ${files.length} items!`);
            setIsUploadModalOpen(false);
            setFiles(null);
            fetchContent(); // Refresh grid
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Ensure backend is running.");
        } finally {
            setUploading(false);
        }
    };

    // --- Views ---

    // 1. Grade Selection View
    const renderGradeSelection = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Grade</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {GRADES.map((grade) => (
                    <button
                        key={grade}
                        onClick={() => handleGradeSelect(grade)}
                        className="aspect-[4/3] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 p-6 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                            {grade.replace('Grade ', '')}
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-primary">{grade}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // 2. Subject Selection View
    const renderSubjectSelection = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Subject for {selectedGrade}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {SUBJECTS.map((subject) => (
                    <button
                        key={subject.name}
                        onClick={() => handleSubjectSelect(subject.name)}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left flex flex-col justify-between h-40"
                    >
                        <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center text-2xl mb-4`}>
                            {subject.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{subject.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">View Content</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // 3. Content Dashboard View
    const renderContentDashboard = () => (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <PlusCircle size={18} />
                    <span>Upload to {selectedSubject}</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center p-12">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'Videos' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => item.videoUrl && setPlayingVideo(item.videoUrl)}
                                        className="aspect-[9/16] bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group relative"
                                    >
                                        <div className={`absolute inset-0 ${item.thumbnail} opacity-30 bg-gray-200`}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                                                <Video size={20} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-8">
                                            <h4 className="text-white font-bold text-sm line-clamp-2">{item.title}</h4>
                                            <span className="text-white/70 text-xs">{item.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Learning Paths' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                                <Map size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                                <p className="text-xs text-gray-500">Modules • Videos</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${item.progress || 0}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Progress</span>
                                            <span>{item.progress || 0}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {!loading && items.length === 0 && (
                    <div className="text-center p-12 text-gray-400">No content found. Upload something!</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
            {/* Breadcrumb Navigation - Always Visible if we are deep in tree */}
            {(selectedGrade || selectedSubject) && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }} className="hover:text-primary transition-colors">Byte-sized Learning</button>
                    {selectedGrade && (
                        <>
                            <ChevronRight size={14} />
                            <button onClick={() => setSelectedSubject(null)} className={`hover:text-primary transition-colors ${!selectedSubject ? 'font-bold text-gray-800' : ''}`}>
                                {selectedGrade}
                            </button>
                        </>
                    )}
                    {selectedSubject && (
                        <>
                            <ChevronRight size={14} />
                            <span className="font-bold text-gray-800">{selectedSubject}</span>
                        </>
                    )}
                </div>
            )}

            {/* Back Button for mobile/easier nav */}
            {(selectedGrade || selectedSubject) && (
                <div className="mb-4">
                    <button onClick={goBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {!selectedGrade && renderGradeSelection()}
                {selectedGrade && !selectedSubject && renderSubjectSelection()}
                {selectedGrade && selectedSubject && renderContentDashboard()}
            </div>

            {/* Upload Modal (Re-used) */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-900">Upload to {selectedSubject}</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:bg-blue-50/50 cursor-pointer transition-colors"
                            >
                                <Upload size={40} className="mb-4 text-gray-400" />
                                <p className="font-medium text-gray-700">Click to Select Files</p>
                                <p className="text-xs text-gray-400 mt-1">MP4, MOV (Max 50MB each)</p>
                            </div>
                            <input ref={fileInputRef} type="file" multiple className="hidden" accept="video/*" onChange={(e) => setFiles(e.target.files)} />
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={handleBulkUpload} className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all">
                                {uploading ? 'Processing...' : 'Upload'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Video Player Modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl relative aspect-video">
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white hover:bg-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={playingVideo}
                            title="Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}
