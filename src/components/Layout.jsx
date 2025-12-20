import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, User, Navigation, Fuel, History, LogIn, LogOut, FileText, ClipboardList } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAppContext();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Painel' },
        { path: '/trip', icon: Navigation, label: 'Viagem Atual' },
        { path: '/service-order', icon: ClipboardList, label: 'Ordem de Serviço' },
        { path: '/history', icon: History, label: 'Histórico' },
        { path: '/fuel', icon: Fuel, label: 'Abastecimento' },
        { path: '/reports', icon: FileText, label: 'Relatórios' },
        { path: '/registry', icon: Car, label: 'Cadastro' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
            {/* Sidebar for desktop, Bottom Nav for mobile */}
            <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 glass-morphism border-t md:border-r border-white/10 z-50">
                <div className="flex md:flex-col justify-around md:justify-between h-16 md:h-full p-2 md:p-6">
                    <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-4">
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

                    <div className="hidden md:block mt-auto pt-8 border-t border-white/5">
                        {user ? (
                            <div className="space-y-4">
                                <div className="px-3 py-2 bg-white/5 rounded-xl">
                                    <p className="text-xs text-muted-foreground">Logado como</p>
                                    <p className="font-bold text-sm truncate">{user.username}</p>
                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span className="text-sm font-medium">Sair</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <LogIn size={20} />
                                <span className="text-sm font-medium">Entrar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                <header className="md:hidden p-4 glass-morphism sticky top-0 z-40 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-primary">AMA TRIP</h1>
                    </div>
                    {user ? (
                        <button onClick={handleLogout} className="p-2 text-muted-foreground">
                            <LogOut size={20} />
                        </button>
                    ) : (
                        <Link to="/login" className="p-2 text-muted-foreground">
                            <LogIn size={20} />
                        </Link>
                    )}
                </header>
                <div className="max-w-5xl mx-auto p-4 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
