import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Fuel as FuelIcon, Receipt, Camera, CheckCircle } from 'lucide-react';

const Fuel = () => {
    const { cars, addFuelRecord } = useAppContext();
    const [formData, setFormData] = useState({
        carId: '',
        liters: '',
        totalValue: '',
        odometer: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        addFuelRecord(formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ carId: '', liters: '', totalValue: '', odometer: '' });
        }, 3000);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in zoom-in-95">
                <div className="bg-green-500/20 p-6 rounded-full text-green-500">
                    <CheckCircle size={64} />
                </div>
                <h2 className="text-3xl font-bold">Abastecimento Registrado!</h2>
                <p className="text-muted-foreground text-lg">Os dados foram salvos nos registros.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
            <header>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <FuelIcon className="text-primary" />
                    Combustível & Manutenção
                </h2>
                <p className="text-muted-foreground">Acompanhe suas despesas e o estado do veículo.</p>
            </header>

            <form onSubmit={handleSubmit} className="glass-morphism p-8 rounded-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Veículo</label>
                    <select
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.carId}
                        onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                    >
                        <option value="">Escolher Veículo</option>
                        {cars.map(car => <option key={car.id} value={car.id}>{car.model} ({car.plate})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Litros</label>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={formData.liters}
                                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">L</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Valor Total (R$)</label>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                                value={formData.totalValue}
                                onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Foto do Comprovante</label>
                    <label className="block border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                        <Receipt size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-sm text-muted-foreground">Carregar foto do comprovante para contabilidade</p>
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full accent-gradient py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                    <FuelIcon size={20} />
                    <span>REGISTRAR ABASTECIMENTO</span>
                </button>
            </form>
        </div>
    );
};

export default Fuel;
