import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, MapPin, Gauge, Fuel } from 'lucide-react';

const Dashboard = () => {
    const { trips, activeTrip, cars, drivers } = useAppContext();

    const totalMileage = trips.reduce((acc, trip) => acc + (parseInt(trip.finalMileage) - parseInt(trip.initialMileage)), 0);
    const totalTrips = trips.length;

    const stats = [
        { label: 'KM Percorridos', value: `${totalMileage} km`, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Total de Viagens', value: totalTrips, icon: MapPin, color: 'text-green-400' },
        { label: 'Veículos', value: cars.length, icon: Gauge, color: 'text-purple-400' },
        { label: 'Motoristas', value: drivers.length, icon: Fuel, color: 'text-orange-400' },
    ];

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
                        <h3 className="text-2xl font-bold text-white mt-1">Dirigindo: {activeTrip.carModel}</h3>
                        <p className="text-white/80">Iniciado às {new Date(activeTrip.startTime).toLocaleTimeString()}</p>
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
                                <p className="font-medium">{trip.carModel} - {trip.driverName}</p>
                                <p className="text-sm text-muted-foreground">{new Date(trip.endTime).toLocaleDateString()} • {trip.destination || 'RJ'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">+{parseInt(trip.finalMileage) - parseInt(trip.initialMileage)} km</p>
                                <p className="text-xs text-muted-foreground">{trip.initialMileage} → {trip.finalMileage} km</p>
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
