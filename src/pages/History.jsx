import React from 'react';
import { useAppContext } from '../context/AppContext';
import { History as HistoryIcon, MapPin, Calendar, ArrowRight, Printer } from 'lucide-react';

const History = () => {
    const { trips } = useAppContext();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <HistoryIcon className="text-primary" />
                        Histórico de Viagens
                    </h2>
                    <p className="text-muted-foreground">Veja todas as missões passadas e detalhes dos registros.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 transition-all font-medium"
                >
                    <Printer size={18} />
                    Imprimir
                </button>
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
                                            {new Date(trip.end_time).toLocaleString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">{trip.cars?.model || 'Veículo Removido'}</h3>
                                        <p className="text-muted-foreground flex items-center mt-1">
                                            <User size={16} className="mr-2" />
                                            {trip.drivers?.name || 'Motorista Removido'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/5 px-4 py-2 rounded-xl">
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Inicial</p>
                                            <p className="font-mono text-lg">{trip.start_km} km</p>
                                        </div>
                                        <ArrowRight className="text-muted-foreground" size={20} />
                                        <div className="bg-white/5 px-4 py-2 rounded-xl text-right">
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Final</p>
                                            <p className="font-mono text-lg">{trip.end_km} km</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                    <div className="flex items-center text-primary font-bold text-2xl">
                                        <Navigation size={24} className="mr-2" />
                                        +{parseFloat(trip.end_km) - parseFloat(trip.start_km)} km
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <span className="text-[10px] uppercase font-bold text-blue-400 mr-2">Início:</span>
                                            <MapPin size={14} className="mr-1" />
                                            {trip.origin || 'Não registrado'}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-[10px] uppercase font-bold text-green-400 mr-2">Fim:</span>
                                            <MapPin size={14} className="mr-1" />
                                            {trip.destination || 'Não registrado'}
                                        </div>
                                    </div>
                                    {trip.observations && (
                                        <div className="mt-2 text-sm italic text-muted-foreground bg-white/5 p-3 rounded-lg max-w-xs">
                                            "{trip.observations}"
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
