import { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { videoService, debugFirebaseSync } from '../lib/videoService';

interface SyncStatus {
    isAuthenticated: boolean;
    firebaseConnected: boolean;
    videosCount: number;
    categoriesCount: number;
    lastError: string | null;
    timestamp: Date;
}

export function DebugSyncPanel() {
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState<SyncStatus | null>(null);
    const [checking, setChecking] = useState(false);

    const checkSync = async () => {
        setChecking(true);
        try {
            await debugFirebaseSync();
            
            // Try to fetch videos
            const { videos } = await videoService.getVideosFeed('', 1000);
            
            // Try to get categories
            const categories = await videoService.getCategories();
            
            setStatus({
                isAuthenticated: true,
                firebaseConnected: true,
                videosCount: videos.length,
                categoriesCount: categories.length,
                lastError: null,
                timestamp: new Date()
            });
        } catch (error) {
            setStatus({
                isAuthenticated: false,
                firebaseConnected: false,
                videosCount: 0,
                categoriesCount: 0,
                lastError: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden max-w-sm">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
                <span className="text-sm font-semibold text-gray-300">Sync Status</span>
                <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="p-4 border-t border-gray-700 space-y-4 max-h-96 overflow-y-auto">
                    <button
                        onClick={checkSync}
                        disabled={checking}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                        {checking ? 'Checking...' : 'Check Sync Status'}
                    </button>

                    {status && (
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                {status.firebaseConnected ? (
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <div className="text-gray-400">Firebase Connection</div>
                                    <div className="text-gray-200">
                                        {status.firebaseConnected ? '✓ Connected' : '✗ Disconnected'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                {status.videosCount > 0 ? (
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <div className="text-gray-400">Videos in Firestore</div>
                                    <div className="text-gray-200">{status.videosCount} found</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                {status.categoriesCount > 0 ? (
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <div className="text-gray-400">Categories</div>
                                    <div className="text-gray-200">{status.categoriesCount} found</div>
                                </div>
                            </div>

                            {status.lastError && (
                                <div className="p-2 bg-red-900/30 border border-red-700 rounded text-red-300">
                                    <div className="font-semibold">Error:</div>
                                    <div className="break-words">{status.lastError}</div>
                                </div>
                            )}

                            <div className="text-gray-500 text-xs pt-2">
                                Last checked: {status.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>💡 Check browser console for detailed logs</p>
                            <p>📤 Upload a file to test sync</p>
                            <p>🔄 Click "Check Sync Status" after upload</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
