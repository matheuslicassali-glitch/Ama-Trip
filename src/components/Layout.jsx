import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, User, Navigation, Fuel, History } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Painel' },
        { path: '/trip', icon: Navigation, label: 'Viagem Atual' },
        { path: '/history', icon: History, label: 'Histórico' },
        { path: '/fuel', icon: Fuel, label: 'Abastecimento' },
        { path: '/registry', icon: Car, label: 'Cadastro' },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
            {/* Sidebar for desktop, Bottom Nav for mobile */}
            <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 glass-morphism border-t md:border-r border-white/10 z-50">
                <div className="flex md:flex-col justify-around md:justify-start h-16 md:h-full p-2 md:p-6 md:space-y-4">
                    <div className="hidden md:block mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">AMA TRIP</h1>
                        <p className="text-xs text-muted-foreground">Gestão Logística</p>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:p-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                <header className="md:hidden p-4 glass-morphism sticky top-0 z-40">
                    <h1 className="text-xl font-bold text-primary">AMA TRIP</h1>
                </header>
                <div className="max-w-5xl mx-auto p-4 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
