import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Fuel as FuelIcon, Receipt, Camera, CheckCircle } from 'lucide-react';

const Fuel = () => {
    const { cars, addFuelRecord, loading } = useAppContext();
    const [formData, setFormData] = useState({
        car_id: '',
        liters: '',
        value: '',
        km: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState('');

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setReceiptPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let receiptUrl = '';

        // Upload foto do comprovante se existir
        if (receiptFile) {
            try {
                const fileExt = receiptFile.name.split('.').pop();
                const fileName = `fuel-receipt-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('fuel-receipts')
                    .upload(fileName, receiptFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('fuel-receipts')
                    .getPublicUrl(fileName);

                receiptUrl = data.publicUrl;
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert('Erro ao fazer upload da foto do comprovante');
            }
        }

        await addFuelRecord({
            car_id: formData.car_id,
            liters: parseFloat(formData.liters),
            value: parseFloat(formData.value),
            km: parseFloat(formData.km),
            date: new Date().toISOString(),
            receipt_photo: receiptUrl
        });
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ car_id: '', liters: '', value: '', km: '' });
            setReceiptFile(null);
            setReceiptPreview('');
        }, 3000);
    };

    if (loading) {
        return <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

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
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                        value={formData.car_id}
                        onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                    >
                        <option value="" className="bg-slate-900">Escolher Veículo</option>
                        {cars.map(car => <option key={car.id} value={car.id} className="bg-slate-900">{car.model} ({car.plate})</option>)}
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
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
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
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-white"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quilometragem Atual (km)</label>
                    <input
                        required
                        type="number"
                        placeholder="ex: 124500"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                        value={formData.km}
                        onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Foto do Comprovante</label>
                    <label className={`block border-2 border-dashed ${receiptPreview ? 'border-primary bg-primary/10' : 'border-white/10'} rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group`}>
                        {receiptPreview ? (
                            <div className="text-center">
                                <img src={receiptPreview} alt="Preview" className="max-h-32 mx-auto rounded mb-2 shadow-lg" />
                                <p className="text-xs text-primary font-bold">Foto selecionada (Clique para alterar)</p>
                            </div>
                        ) : (
                            <>
                                <Receipt size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-sm text-muted-foreground">Carregar foto do comprovante para contabilidade</p>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleReceiptChange} />
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
