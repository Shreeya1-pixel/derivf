import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-app overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto relative" style={{ marginLeft: '260px' }}>
                <div style={{ padding: '0px', height: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
