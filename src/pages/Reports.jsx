import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import {
    FileText,
    Printer,
    Calendar,
    Car,
    User,
    Fuel as FuelIcon,
    Navigation,
    Image as ImageIcon,
    Download,
    ChevronRight,
    Filter
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reports = () => {
    const { trips, fuelRecords, cars, drivers, loading } = useAppContext();
    const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
    const [reportType, setReportType] = useState('all'); // all, trips, fuel
    const printRef = useRef();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Filter logic
    const getInterval = () => {
        const now = new Date();
        if (period === 'daily') return { start: startOfDay(now), end: endOfDay(now) };
        if (period === 'weekly') return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        if (period === 'monthly') return { start: startOfMonth(now), end: endOfMonth(now) };
        return { start: startOfDay(now), end: endOfDay(now) };
    };

    const interval = getInterval();

    const filteredTrips = trips.filter(trip =>
        isWithinInterval(new Date(trip.end_time), interval)
    );

    const filteredFuel = fuelRecords.filter(fuel =>
        isWithinInterval(new Date(fuel.date), interval)
    );

    const handlePrint = () => {
        window.print();
    };

    const totalKm = filteredTrips.reduce((acc, t) => acc + (parseFloat(t.end_km) - parseFloat(t.start_km)), 0);
    const totalFuelCost = filteredFuel.reduce((acc, f) => acc + parseFloat(f.value), 0);
    const totalLiters = filteredFuel.reduce((acc, f) => acc + parseFloat(f.liters), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header - Hidden on Print */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="text-primary" />
                        Relatórios Logísticos
                    </h2>
                    <p className="text-muted-foreground">Analise o desempenho da frota e custos de operação.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 transition-all font-medium"
                    >
                        <Printer size={18} />
                        Imprimir / PDF
                    </button>
                </div>
            </header>

            {/* Filters - Hidden on Print */}
            <div className="flex flex-col md:flex-row gap-4 print:hidden">
                <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${period === p ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}
                        </button>
                    ))}
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                    {['all', 'trips', 'fuel'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setReportType(t)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${reportType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {t === 'all' ? 'Tudo' : t === 'trips' ? 'Viagens' : 'Combustível'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Print Header - Only Visible on Print */}
            <div className="hidden print:block text-black mb-8 border-b-2 border-black pb-4 text-center">
                <h1 className="text-4xl font-black uppercase">AMA TRIP - RELATÓRIO LOGÍSTICO</h1>
                <p className="text-lg">Período: {format(interval.start, "dd/MM/yyyy")} até {format(interval.end, "dd/MM/yyyy")}</p>
                <p className="text-sm mt-2 text-gray-600">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-morphism p-6 rounded-2xl border-l-4 border-blue-500 print:bg-gray-50 print:border-blue-700 print:text-black">
                    <div className="flex items-center gap-3 text-blue-400 mb-2 print:text-blue-700">
                        <Navigation size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Km Percorridos</span>
                    </div>
                    <p className="text-3xl font-black font-mono">{totalKm.toFixed(1)} <span className="text-sm uppercase">KM</span></p>
                    <p className="text-xs text-muted-foreground mt-1 print:text-gray-500">{filteredTrips.length} viagens registradas</p>
                </div>

                <div className="glass-morphism p-6 rounded-2xl border-l-4 border-green-500 print:bg-gray-50 print:border-green-700 print:text-black">
                    <div className="flex items-center gap-3 text-green-400 mb-2 print:text-green-700">
                        <FuelIcon size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Investimento</span>
                    </div>
                    <p className="text-3xl font-black font-mono">R$ {totalFuelCost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1 print:text-gray-500">{totalLiters.toFixed(2)} litros totais</p>
                </div>

                <div className="glass-morphism p-6 rounded-2xl border-l-4 border-purple-500 print:bg-gray-50 print:border-purple-700 print:text-black">
                    <div className="flex items-center gap-3 text-purple-400 mb-2 print:text-purple-700">
                        <Filter size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Média Geral</span>
                    </div>
                    <p className="text-3xl font-black font-mono">{(totalKm / (totalLiters || 1)).toFixed(2)} <span className="text-sm uppercase">KM/L</span></p>
                    <p className="text-xs text-muted-foreground mt-1 print:text-gray-500">Eficiência da frota no período</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-10">

                {/* Trips Section */}
                {(reportType === 'all' || reportType === 'trips') && (
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2 print:text-black print:border-black">
                            <Navigation className="text-primary" size={24} />
                            Detalhamento de Viagens
                        </h3>
                        {filteredTrips.length > 0 ? (
                            <div className="space-y-4">
                                {filteredTrips.map((trip) => (
                                    <div key={trip.id} className="glass-morphism p-4 rounded-xl print:border print:border-gray-300 print:bg-white print:text-black break-inside-avoid">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center print:border print:border-gray-200">
                                                    <Car className="text-primary" size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{trip.cars?.model}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 print:text-gray-600">
                                                        <User size={14} /> {trip.drivers?.name} • {format(new Date(trip.end_time), "dd/MM/yyyy HH:mm")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-primary">+{parseFloat(trip.end_km) - parseFloat(trip.start_km)} KM</p>
                                                <p className="text-xs text-muted-foreground font-mono print:text-gray-500">{trip.start_km} km → {trip.end_km} km</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg flex items-center gap-2 text-sm text-muted-foreground print:bg-gray-50 print:text-black">
                                            <Calendar size={14} />
                                            <span>Destino: {trip.destination || 'Rio de Janeiro'}</span>
                                            {trip.observations && <span className="ml-4 border-l border-white/10 pl-4">Obs: {trip.observations}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center glass-morphism rounded-xl text-muted-foreground">Nenhuma viagem no período selecionado.</div>
                        )}
                    </section>
                )}

                {/* Fuel Section */}
                {(reportType === 'all' || reportType === 'fuel') && (
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2 mt-8 print:text-black print:border-black">
                            <FuelIcon className="text-green-500" size={24} />
                            Controle de Abastecimentos
                        </h3>
                        {filteredFuel.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredFuel.map((fuel) => {
                                    const car = cars.find(c => c.id === fuel.car_id);
                                    return (
                                        <div key={fuel.id} className="glass-morphism p-5 rounded-2xl flex flex-col gap-4 print:border print:border-gray-300 print:bg-white print:text-black break-inside-avoid">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500 print:bg-green-50 print:border print:border-green-200">
                                                        <FuelIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{car?.model || 'Veículo'}</p>
                                                        <p className="text-xs text-muted-foreground print:text-gray-600">{format(new Date(fuel.date), "dd/MM/yyyy HH:mm")}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-green-500 text-lg">R$ {parseFloat(fuel.value).toFixed(2)}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{fuel.liters}L • {fuel.km}km</p>
                                                </div>
                                            </div>

                                            {/* Receipt Photo Area */}
                                            <div className="aspect-video bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all cursor-pointer overflow-hidden print:border-gray-300 print:bg-gray-50">
                                                {/* In a real app, this would show the URL from Supabase Storage */}
                                                <ImageIcon className="text-muted-foreground/30 group-hover:text-primary transition-colors" size={32} />
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">Foto do Comprovante</p>
                                                <div className="hidden print:block text-xs text-gray-400 italic">Espaço para anexo de comprovante</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center glass-morphism rounded-xl text-muted-foreground">Nenhum abastecimento no período selecionado.</div>
                        )}
                    </section>
                )}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-20 pt-8 border-t border-black text-center text-sm">
                <div className="flex justify-around mb-12">
                    <div className="w-64 border-t border-black pt-2">Assinatura do Responsável</div>
                    <div className="w-64 border-t border-black pt-2">Assinatura Logística</div>
                </div>
                <p>AMA TRIP - Sistema de Gestão de Transportes</p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; }
                    body { background: white !important; color: black !important; }
                    .glass-morphism { 
                        background: white !important; 
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                    }
                    .accent-gradient, .bg-primary { background: #000 !important; color: white !important; }
                    nav, header.print\\:hidden, .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .max-w-5xl { max-width: 100% !important; }
                }
            ` }} />
        </div>
    );
};

export default Reports;
