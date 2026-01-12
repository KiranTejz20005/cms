import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Save, Bell, Lock, Globe, X } from 'lucide-react';

export function SettingsPage() {
    const { platformName, setPlatformName } = useConfig();
    const [showSSOModal, setShowSSOModal] = useState(false);
    const [ssoConfig, setSsoConfig] = useState({
        provider: 'Google',
        clientId: '',
        clientSecret: '',
        tenantId: '',
        redirectUrl: `${window.location.origin}/auth/callback`
    });

    const handleSaveSSO = () => {
        // Here you would typically save this to your backend config

        setShowSSOModal(false);
        alert("SSO Settings Saved Successfully!");
    };

    const handleCreateDefaultAdmin = async () => {
        if (!confirm("This will create a default admin user 'admin2@cms.com' with password 'SecurePass123!'. Continue?")) return;

        try {
            const { supabase } = await import('../lib/supabase');
            const adminUser = {
                email: 'admin2@cms.com',
                password: 'SecurePass123!',
                full_name: 'System Admin'
            };

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: adminUser.email,
                password: adminUser.password,
                options: { data: { full_name: adminUser.full_name } }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    alert("User already exists!");
                } else {
                    alert(`Error creating user: ${authError.message}`);
                }
                return;
            }

            if (authData?.user) {
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: authData.user.id,
                    email: adminUser.email,
                    full_name: adminUser.full_name,
                    role: 'admin',
                    created_at: new Date().toISOString()
                }]);
                if (profileError) alert(`Profile Error: ${profileError.message}`);
                else alert(`Success! Created Admin: ${adminUser.email}`);
            }
        } catch (e: any) {
            alert(`Unexpected error: ${e.message}`);
        }
    };

    return (
        <div className="max-w-4xl relative">
            {/* SSO Modal */}
            {showSSOModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-text-primary">Configure SSO</h3>
                            <button onClick={() => setShowSSOModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Provider</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                                    value={ssoConfig.provider}
                                    onChange={(e) => setSsoConfig({ ...ssoConfig, provider: e.target.value })}
                                >
                                    <option>Google Workspace</option>
                                    <option>Microsoft Azure AD</option>
                                    <option>Okta</option>
                                    <option>Auth0</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Client ID</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm shadow-sm"
                                    placeholder="Enter Client ID"
                                    value={ssoConfig.clientId}
                                    onChange={(e) => setSsoConfig({ ...ssoConfig, clientId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Client Secret</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm shadow-sm"
                                    placeholder="Enter Client Secret"
                                    value={ssoConfig.clientSecret}
                                    onChange={(e) => setSsoConfig({ ...ssoConfig, clientSecret: e.target.value })}
                                />
                            </div>

                            {ssoConfig.provider === 'Microsoft Azure AD' && (
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Tenant ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm shadow-sm"
                                        placeholder="Enter Tenant ID"
                                        value={ssoConfig.tenantId}
                                        onChange={(e) => setSsoConfig({ ...ssoConfig, tenantId: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">Redirect URL (Read-only)</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm"
                                    value={ssoConfig.redirectUrl}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowSSOModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSSO}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-text-primary mb-6">Platform Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">

                {/* General Section */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Globe size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-1">General Configuration</h3>
                            <p className="text-sm text-text-secondary mb-4">Manage platform name, language, and regional settings.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Platform Name</label>
                                    <input
                                        type="text"
                                        value={platformName}
                                        onChange={(e) => setPlatformName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Default Language</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm bg-white">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Bell size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-1">Notifications</h3>
                            <p className="text-sm text-text-secondary mb-4">Control email and push notification defaults.</p>

                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked />
                                    <span className="ml-3 text-sm text-text-primary">Enable email digests for instructors</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked />
                                    <span className="ml-3 text-sm text-text-primary">Notify students of new course content</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Lock size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-1">Access & Security</h3>
                            <p className="text-sm text-text-secondary mb-4">Configure password policies and 2FA.</p>

                            <div className="flex gap-4">
                                <button onClick={() => setShowSSOModal(true)} className="text-primary text-sm font-medium hover:underline">Manage SSO Settings</button>
                                <button onClick={handleCreateDefaultAdmin} className="text-red-500 text-sm font-medium hover:underline">Create Default Admin</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-6 flex justify-end">
                <button className="flex items-center bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
                    <Save size={18} className="mr-2" /> Save Changes
                </button>
            </div>
        </div>
    );
}
