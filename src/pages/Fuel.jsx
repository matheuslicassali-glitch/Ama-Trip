import React, { useState } from 'react';
import { History } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Fuel as FuelIcon, Receipt, Camera, CheckCircle, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import AdminPasswordModal from '../components/AdminPasswordModal';
import { supabase } from '../lib/supabase';

const Fuel = () => {
    const { cars, addFuelRecord, fuelRecords, updateFuelRecord, deleteFuelRecord, loading } = useAppContext();
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null); // { type: 'delete'|'edit', payload: any }
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        car_id: '',
        liters: '',
        value: '',
        km: '',

    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoUrl = '';

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('fuel-receipts')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('fuel-receipts')
                    .getPublicUrl(filePath);

                photoUrl = data.publicUrl;
            }

            if (editingId) {
                await updateFuelRecord(editingId, {
                    car_id: formData.car_id,
                    liters: parseFloat(formData.liters),
                    value: parseFloat(formData.value),
                    km: parseFloat(formData.km),
                    receipt_url: photoUrl
                });
                alert("Abastecimento atualizado!");
                setEditingId(null);
            } else {
                await addFuelRecord({
                    car_id: formData.car_id,
                    liters: parseFloat(formData.liters),
                    value: parseFloat(formData.value),
                    km: parseFloat(formData.km),
                    date: new Date().toISOString(),
                    receipt_url: photoUrl
                });
            }

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ car_id: '', liters: '', value: '', km: '' });
                setFile(null);
                setPreview(null);
            }, 3000);
        } catch (error) {
            console.error('Error saving fuel record:', error);
            alert('Erro ao salvar abastecimento: ' + error.message);
        }
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
                    {preview ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 group">
                            <img src={preview} alt="Preview" className="w-full h-64 object-contain bg-black/50" />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="bg-red-500/20 text-red-500 p-4 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={24} />
                                </button>
                                <p className="text-white text-sm mt-2 font-medium">Remover Foto</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all active:scale-95 bg-white/5">
                                <Camera size={32} className="mb-2 text-primary" />
                                <span className="text-sm font-bold">Usar Câmera</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            </label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all active:scale-95 bg-white/5">
                                <ImageIcon size={32} className="mb-2 text-blue-400" />
                                <span className="text-sm font-bold">Abrir Galeria</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full accent-gradient py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                    <FuelIcon size={20} />
                    <span>{editingId ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR ABASTECIMENTO'}</span>
                </button>
            </form>

            {/* List of Recent Fuel Records */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
                    <History size={20} className="text-primary" />
                    Últimos Abastecimentos
                </h3>
                {fuelRecords.slice(0, 5).map(record => (
                    <div key={record.id} className="glass-morphism p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <FuelIcon size={20} />
                            </div>
                            <div>
                                <p className="font-bold">{cars.find(c => c.id === record.car_id)?.model || 'Carro'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()} • {record.liters}L • R$ {record.value}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setActionToConfirm({ type: 'edit', payload: record });
                                    setShowAdminModal(true);
                                }}
                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setActionToConfirm({ type: 'delete', payload: record.id });
                                    setShowAdminModal(true);
                                }}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AdminPasswordModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onSuccess={() => {
                    if (actionToConfirm?.type === 'delete') {
                        deleteFuelRecord(actionToConfirm.payload);
                    } else if (actionToConfirm?.type === 'edit') {
                        const rec = actionToConfirm.payload;
                        setFormData({
                            car_id: rec.car_id,
                            liters: rec.liters,
                            value: rec.value,
                            km: rec.km
                        });
                        setEditingId(rec.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                title={actionToConfirm?.type === 'delete' ? "Excluir Abastecimento" : "Editar Abastecimento"}
            />
        </div>
    );
};

export default Fuel;
