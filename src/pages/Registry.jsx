import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Car, User, Trash2 } from 'lucide-react';

const Registry = () => {
    const { cars, drivers, addCar, addDriver, user } = useAppContext();
    const [activeTab, setActiveTab] = useState('cars');
    const [carForm, setCarForm] = useState({ model: '', plate: '', year: '' });
    const [driverForm, setDriverForm] = useState({ name: '', license: '', contact: '' });

    const isAdmin = user?.role === 'admin';

    const handleCarSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        addCar(carForm);
        setCarForm({ model: '', plate: '', year: '' });
    };

    const handleDriverSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        addDriver(driverForm);
        setDriverForm({ name: '', license: '', contact: '' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-3xl font-bold">Cadastro</h2>
                <p className="text-muted-foreground">Gerencie sua frota e pessoal.</p>
            </header>

            <div className="flex space-x-2 p-1 bg-white/5 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('cars')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'cars' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                >
                    Veículos
                </button>
                <button
                    onClick={() => setActiveTab('drivers')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'drivers' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                >
                    Motoristas
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="md:col-span-1">
                    {isAdmin ? (
                        <div className="glass-morphism p-6 rounded-2xl sticky top-24 border border-white/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-primary" />
                                Adicionar Novo {activeTab === 'cars' ? 'Veículo' : 'Motorista'}
                            </h3>

                            {activeTab === 'cars' ? (
                                <form onSubmit={handleCarSubmit} className="space-y-4">
                                    <input required placeholder="Modelo (ex: Toyota Corolla)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} />
                                    <input required placeholder="Placa (ex: ABC-1234)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={carForm.plate} onChange={e => setCarForm({ ...carForm, plate: e.target.value })} />
                                    <input placeholder="Ano" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={carForm.year} onChange={e => setCarForm({ ...carForm, year: e.target.value })} />
                                    <button className="w-full bg-primary py-3 rounded-xl font-bold text-white mt-2 hover:bg-primary/90 transition-colors">CADASTRAR CARRO</button>
                                </form>
                            ) : (
                                <form onSubmit={handleDriverSubmit} className="space-y-4">
                                    <input required placeholder="Nome Completo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} />
                                    <input required placeholder="Número da CNH" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={driverForm.license} onChange={e => setDriverForm({ ...driverForm, license: e.target.value })} />
                                    <input placeholder="Telefone de Contato" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-white" value={driverForm.contact} onChange={e => setDriverForm({ ...driverForm, contact: e.target.value })} />
                                    <button className="w-full bg-primary py-3 rounded-xl font-bold text-white mt-2 hover:bg-primary/90 transition-colors">CADASTRAR MOTORISTA</button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="glass-morphism p-8 rounded-2xl sticky top-24 border border-red-500/20 bg-red-500/5 text-center">
                            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Plus size={32} className="rotate-45" />
                            </div>
                            <h3 className="text-lg font-bold text-red-400 mb-2">Acesso Restrito</h3>
                            <p className="text-sm text-red-300/60 leading-relaxed">
                                Somente usuários administradores podem realizar novos cadastros de {activeTab === 'cars' ? 'veículos' : 'motoristas'}.
                            </p>
                        </div>
                    )}
                </div>

                {/* List Column */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold mb-4">Registros Existentes</h3>
                    {activeTab === 'cars' ? (
                        cars.length > 0 ? cars.map(car => (
                            <div key={car.id} className="glass-morphism p-5 rounded-xl flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                                        <Car size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold">{car.model}</p>
                                        <p className="text-sm text-muted-foreground">{car.plate} {car.year && `• ${car.year}`}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )) : <p className="text-center py-10 text-muted-foreground glass-morphism rounded-xl">Nenhum carro cadastrado ainda.</p>
                    ) : (
                        drivers.length > 0 ? drivers.map(driver => (
                            <div key={driver.id} className="glass-morphism p-5 rounded-xl flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-full text-green-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold">{driver.name}</p>
                                        <p className="text-sm text-muted-foreground">{driver.license} • {driver.contact || 'Sem contato'}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )) : <p className="text-center py-10 text-muted-foreground glass-morphism rounded-xl">Nenhum motorista cadastrado ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Registry;
