import React from 'react';
import { useAppContext } from '../context/AppContext';
import { History as HistoryIcon, MapPin, Calendar, ArrowRight } from 'lucide-react';

const History = () => {
    const { trips } = useAppContext();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <HistoryIcon className="text-primary" />
                    Histórico de Viagens
                </h2>
                <p className="text-muted-foreground">Veja todas as missões passadas e detalhes dos registros.</p>
            </header>

            {trips.length > 0 ? (
                <div className="grid gap-4">
                    {trips.map((trip) => (
                        <div key={trip.id} className="glass-morphism p-6 rounded-2xl border-l-4 border-primary hover:bg-white/10 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                            Concluído
                                        </span>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(trip.endTime).toLocaleString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">{trip.carModel}</h3>
                                        <p className="text-muted-foreground flex items-center mt-1">
                                            <User size={16} className="mr-2" />
                                            {trip.driverName}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/5 px-4 py-2 rounded-xl">
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Inicial</p>
                                            <p className="font-mono text-lg">{trip.initialMileage} km</p>
                                        </div>
                                        <ArrowRight className="text-muted-foreground" size={20} />
                                        <div className="bg-white/5 px-4 py-2 rounded-xl text-right">
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Final</p>
                                            <p className="font-mono text-lg">{trip.finalMileage} km</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                    <div className="flex items-center text-primary font-bold text-2xl">
                                        <Navigation size={24} className="mr-2" />
                                        +{parseInt(trip.finalMileage) - parseInt(trip.initialMileage)} km
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <MapPin size={16} className="mr-2" />
                                        {trip.destination || 'Área Metropolitana do RJ'}
                                    </div>
                                    {trip.comments && (
                                        <div className="mt-2 text-sm italic text-muted-foreground bg-white/5 p-3 rounded-lg max-w-xs">
                                            "{trip.comments}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-morphism rounded-2xl border-dashed border-2 border-white/10">
                    <HistoryIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-medium text-muted-foreground">Nenhum registro encontrado</h3>
                    <p className="text-sm text-muted-foreground/60 mt-1">Inicie sua primeira viagem para ver o histórico aqui.</p>
                </div>
            )}
        </div>
    );
};

import { User, Navigation } from 'lucide-react';
export default History;
