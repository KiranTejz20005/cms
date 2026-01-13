import { useEffect, useState } from 'react';
import { Search, Mail, Loader, User, Edit2, Save, X, Trash2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { strapiApi } from '../lib/strapi';

const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : '?';

interface Profile {
    id: string | number;
    email: string;
    full_name?: string; // Supabase
    username?: string; // Strapi
    role?: string;
    created_at?: string;
    authProvider: 'Supabase' | 'Strapi';
    // For editing
    isEditing?: boolean;
    tempRole?: string;
}

export function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Add User Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'user',
        provider: 'Strapi' as 'Strapi' | 'Supabase'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        let allUsers: Profile[] = [];

        // 1. Fetch from Strapi
        try {
            const strapiData = await strapiApi.find('users', { populate: 'role' });
            if (Array.isArray(strapiData)) {
                const sUsers = strapiData.map((u: any) => ({
                    id: u.id,
                    email: u.email,
                    username: u.username,
                    full_name: u.username,
                    role: u.role?.name || 'Authenticated',
                    created_at: u.createdAt,
                    authProvider: 'Strapi' as const
                }));
                allUsers = [...allUsers, ...sUsers];
            }
        } catch (e) {
            console.warn('Could not fetch users from Strapi:', e);
        }

        // 2. Fetch from Supabase
        try {
            const { data: sbData, error: sbError } = await supabase.from('profiles').select('*');
            if (!sbError && sbData) {
                const sbUsers = sbData.map(u => ({
                    id: u.id,
                    email: u.email,
                    full_name: u.full_name,
                    role: u.role || 'user',
                    created_at: u.created_at,
                    authProvider: 'Supabase' as const
                }));
                allUsers = [...allUsers, ...sbUsers];
            } else if (sbError) {
                console.warn('Could not fetch users from Supabase:', sbError.message);
            }
        } catch (e) {
            console.warn('Supabase fetch error:', e);
        }

        // 3. If no users found, use comprehensive dummy data
        if (allUsers.length === 0) {
            const dummyUsers: Profile[] = [
                // Admins (5)
                { id: 'dummy-1', email: 'admin@edusystem.com', full_name: 'Sarah Johnson', role: 'Admin', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-2', email: 'john.admin@edusystem.com', full_name: 'John Martinez', role: 'Admin', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 320).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-3', email: 'emily.super@edusystem.com', full_name: 'Emily Chen', role: 'Super Admin', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-4', email: 'michael.admin@edusystem.com', full_name: 'Michael Brown', role: 'Admin', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 280).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-5', email: 'lisa.admin@edusystem.com', full_name: 'Lisa Anderson', role: 'Admin', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 250).toISOString(), authProvider: 'Strapi' },

                // Editors (6)
                { id: 'dummy-6', email: 'david.editor@edusystem.com', full_name: 'David Wilson', role: 'Editor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-7', email: 'sophia.content@edusystem.com', full_name: 'Sophia Garcia', role: 'Content Editor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-8', email: 'james.editor@edusystem.com', full_name: 'James Taylor', role: 'Editor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-9', email: 'olivia.review@edusystem.com', full_name: 'Olivia Davis', role: 'Content Reviewer', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-10', email: 'william.editor@edusystem.com', full_name: 'William Moore', role: 'Editor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-11', email: 'ava.media@edusystem.com', full_name: 'Ava Thompson', role: 'Media Editor', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), authProvider: 'Strapi' },

                // Teachers (8)
                { id: 'dummy-12', email: 'robert.teacher@edusystem.com', full_name: 'Robert Lee', role: 'Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 220).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-13', email: 'emma.math@edusystem.com', full_name: 'Emma White', role: 'Math Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-14', email: 'noah.science@edusystem.com', full_name: 'Noah Harris', role: 'Science Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 190).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-15', email: 'isabella.art@edusystem.com', full_name: 'Isabella Martin', role: 'Art Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 170).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-16', email: 'liam.english@edusystem.com', full_name: 'Liam Jackson', role: 'English Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 160).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-17', email: 'mia.music@edusystem.com', full_name: 'Mia Thomas', role: 'Music Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 140).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-18', email: 'ethan.pe@edusystem.com', full_name: 'Ethan Robinson', role: 'PE Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 130).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-19', email: 'charlotte.history@edusystem.com', full_name: 'Charlotte Clark', role: 'History Teacher', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 110).toISOString(), authProvider: 'Strapi' },

                // Content Creators (5)
                { id: 'dummy-20', email: 'lucas.creator@edusystem.com', full_name: 'Lucas Rodriguez', role: 'Content Creator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-21', email: 'amelia.video@edusystem.com', full_name: 'Amelia Lewis', role: 'Video Creator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-22', email: 'mason.podcast@edusystem.com', full_name: 'Mason Walker', role: 'Podcast Creator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-23', email: 'harper.quiz@edusystem.com', full_name: 'Harper Hall', role: 'Quiz Designer', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-24', email: 'evelyn.interactive@edusystem.com', full_name: 'Evelyn Allen', role: 'Interactive Designer', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), authProvider: 'Supabase' },

                // Moderators (3)
                { id: 'dummy-25', email: 'alexander.mod@edusystem.com', full_name: 'Alexander Young', role: 'Moderator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-26', email: 'abigail.mod@edusystem.com', full_name: 'Abigail King', role: 'Community Moderator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-27', email: 'daniel.support@edusystem.com', full_name: 'Daniel Wright', role: 'Support Moderator', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 65).toISOString(), authProvider: 'Strapi' },

                // Students (5)
                { id: 'dummy-28', email: 'ella.student@edusystem.com', full_name: 'Ella Lopez', role: 'Student', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-29', email: 'matthew.student@edusystem.com', full_name: 'Matthew Hill', role: 'Student', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-30', email: 'scarlett.student@edusystem.com', full_name: 'Scarlett Scott', role: 'Student', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-31', email: 'sebastian.student@edusystem.com', full_name: 'Sebastian Green', role: 'Student', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-32', email: 'grace.student@edusystem.com', full_name: 'Grace Adams', role: 'Student', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), authProvider: 'Supabase' },

                // Parents (3)
                { id: 'dummy-33', email: 'victoria.parent@edusystem.com', full_name: 'Victoria Baker', role: 'Parent', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), authProvider: 'Strapi' },
                { id: 'dummy-34', email: 'henry.parent@edusystem.com', full_name: 'Henry Nelson', role: 'Parent', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), authProvider: 'Supabase' },
                { id: 'dummy-35', email: 'zoey.parent@edusystem.com', full_name: 'Zoey Carter', role: 'Parent', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(), authProvider: 'Strapi' },
            ];
            allUsers = dummyUsers;
        }

        setUsers(allUsers);
        setLoading(false);
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password) return;

        try {
            if (newUser.provider === 'Strapi') {
                try {
                    const { strapiApi } = await import('../lib/strapi');
                    // Uses register endpoint (auth/local/register)
                    await strapiApi.register(newUser.fullName, newUser.email, newUser.password);
                    // Note: Role assignment usually requires subsequent admin API call if not default
                } catch (e: any) {
                    console.error("Strapi register failed:", e);
                    alert("Strapi registration failed. See console.");
                    return;
                }
            } else {
                // Supabase
                const { data, error } = await supabase.auth.signUp({
                    email: newUser.email,
                    password: newUser.password,
                    options: { data: { full_name: newUser.fullName } }
                });

                if (error) {
                    if (error.message.includes('secret API key')) {
                        alert("Configuration Error: You are using a Secret/Service Key in the frontend. Please use the 'anon' public key in your .env file.");
                        return; // Stop here
                    }
                    throw error;
                }

                if (data.user) {
                    // Manual profile insert if no trigger
                    const { error: profileError } = await supabase.from('profiles').insert([{
                        id: data.user.id,
                        email: newUser.email,
                        full_name: newUser.fullName,
                        role: newUser.role,
                        created_at: new Date().toISOString()
                    }]);
                    if (profileError) console.warn("Profile insert warning:", profileError);
                }
            }

            // Success
            await fetchUsers();
            setShowAddModal(false);
            setNewUser({ fullName: '', email: '', password: '', role: 'user', provider: 'Strapi' });
            alert("User created successfully!");

        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('secret API key')) {
                alert("Configuration Error: You are using a Secret Key (starts with sb_secret...) in .env. Please replace it with the 'anon' public key (starts with eyJ...) from Supabase Dashboard > Settings > API.");
            } else {
                alert(`Failed to create user: ${err.message}`);
            }
        }
    };

    const handleRoleUpdate = async (id: string | number, provider: 'Supabase' | 'Strapi', newRole: string) => {
        try {
            if (provider === 'Strapi') {
                alert("Role updates for Strapi users require the Admin API token with correct permissions. Check console for attempt.");
                await strapiApi.update('users', id, { role: newRole });
            } else {
                const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
                if (error) throw error;
            }

            setUsers(users.map(u =>
                u.id === id ? { ...u, role: newRole, isEditing: false } : u
            ));
        } catch (err: any) {
            alert(`Failed to update role: ${err.message}`);
        }
    };

    const toggleEdit = (id: string | number) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, isEditing: !u.isEditing, tempRole: u.role } : u
        ));
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name || u.username)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 relative">
            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-text-primary">Add New User</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Target System</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setNewUser({ ...newUser, provider: 'Strapi' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${newUser.provider === 'Strapi' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Strapi</button>
                                    <button
                                        onClick={() => setNewUser({ ...newUser, provider: 'Supabase' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${newUser.provider === 'Supabase' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Supabase</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Full Name / Username</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="e.g. Jane Doe"
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="jane@example.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={!newUser.email || !newUser.password}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
                    <p className="text-sm text-text-secondary">View and manage user roles and access.</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <User size={18} /> Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={`${user.authProvider}-${user.id}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 border border-blue-200">
                                                    {getInitials(user.full_name || user.username || user.email)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-text-primary capitalize">{user.full_name || user.username || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${user.authProvider === 'Strapi' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {user.authProvider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                                                        value={user.tempRole}
                                                        onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, tempRole: e.target.value } : u))}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="editor">Editor</option>
                                                    </select>
                                                    <button onClick={() => handleRoleUpdate(user.id, user.authProvider, user.tempRole || 'user')} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={14} /></button>
                                                    <button onClick={() => toggleEdit(user.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                                                </div>
                                            ) : (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${(user.role?.toLowerCase().includes('admin'))
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {(user.role?.toLowerCase().includes('admin')) && <Shield size={10} className="mr-1" />}
                                                    {user.role || 'User'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => toggleEdit(user.id)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Edit Role">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
