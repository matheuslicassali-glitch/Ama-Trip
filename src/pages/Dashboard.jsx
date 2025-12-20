import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, MapPin, Gauge, Fuel } from 'lucide-react';

const Dashboard = () => {
    const { trips, activeTrip, cars, drivers, loading } = useAppContext();

    const totalMileage = trips.reduce((acc, trip) => acc + (parseFloat(trip.end_km) - parseFloat(trip.start_km)), 0);
    const totalTrips = trips.length;

    const stats = [
        { label: 'KM Percorridos', value: `${totalMileage.toFixed(1)} km`, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Total de Viagens', value: totalTrips, icon: MapPin, color: 'text-green-400' },
        { label: 'Veículos', value: cars.length, icon: Gauge, color: 'text-purple-400' },
        { label: 'Motoristas', value: drivers.length, icon: Fuel, color: 'text-orange-400' },
    ];

    if (loading) {
        return <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    const activeCar = activeTrip ? cars.find(c => c.id === activeTrip.car_id) : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <h2 className="text-3xl font-bold mb-1">Bem-vindo de volta</h2>
                <p className="text-muted-foreground">Aqui está o que está acontecendo hoje.</p>
            </section>

            {activeTrip && (
                <div className="accent-gradient p-6 rounded-2xl shadow-xl flex justify-between items-center group cursor-pointer hover:scale-[1.01] transition-transform">
                    <div>
                        <span className="text-white/70 text-sm font-medium uppercase tracking-wider">Viagem Ativa</span>
                        <h3 className="text-2xl font-bold text-white mt-1">Dirigindo: {activeCar?.model || 'Veículo'}</h3>
                        <p className="text-white/80">Iniciado às {new Date(activeTrip.start_time).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                        <Navigation className="text-white animate-pulse" size={24} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-morphism p-5 rounded-2xl hover:bg-white/10 transition-colors">
                        <stat.icon size={24} className={`mb-3 ${stat.color}`} />
                        <p className="text-muted-foreground text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <section>
                <h3 className="text-xl font-bold mb-4">Atividade Recente</h3>
                <div className="space-y-3">
                    {trips.slice(0, 5).map((trip) => (
                        <div key={trip.id} className="glass-morphism p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-medium">{trip.cars?.model} - {trip.drivers?.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(trip.end_time).toLocaleDateString()} • {trip.destination || 'RJ'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">+{parseFloat(trip.end_km) - parseFloat(trip.start_km)} km</p>
                                <p className="text-xs text-muted-foreground">{trip.start_km} → {trip.end_km} km</p>
                            </div>
                        </div>
                    ))}
                    {trips.length === 0 && (
                        <div className="text-center py-10 glass-morphism rounded-xl border-dashed border-2 border-white/5">
                            <p className="text-muted-foreground">Nenhuma viagem registrada ainda.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

import { Navigation } from 'lucide-react';
export default Dashboard;
