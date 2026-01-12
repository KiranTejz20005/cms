import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden text-text-primary font-sans">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative scrollable">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
