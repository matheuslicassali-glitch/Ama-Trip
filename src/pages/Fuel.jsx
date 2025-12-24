import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Fuel as FuelIcon, Receipt, CheckCircle, Eye, X, Edit2, Trash2, Calendar, Car } from 'lucide-react';
import { format } from 'date-fns';
import AdminPasswordModal from '../components/AdminPasswordModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

const Fuel = () => {
    const { cars, fuelRecords, addFuelRecord, updateFuelRecord, deleteFuelRecord, loading } = useAppContext();
    const [formData, setFormData] = useState({
        car_id: '',
        liters: '',
        value: '',
        km: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;
                setReceiptPreview(imageUrl);
                // Show preview modal
                setPreviewImage(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let receiptUrl = receiptPreview;

        // Upload foto do comprovante se existir um novo arquivo
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
                return;
            }
        }

        const fuelData = {
            car_id: formData.car_id,
            liters: parseFloat(formData.liters),
            value: parseFloat(formData.value),
            km: parseFloat(formData.km),
            receipt_photo: receiptUrl
        };

        try {
            if (editingId) {
                await updateFuelRecord(editingId, fuelData);
                setEditingId(null);
            } else {
                await addFuelRecord({
                    ...fuelData,
                    date: new Date().toISOString()
                });
            }

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ car_id: '', liters: '', value: '', km: '' });
                setReceiptFile(null);
                setReceiptPreview('');
            }, 3000);
        } catch (error) {
            alert('Erro ao salvar registro: ' + error.message);
        }
    };

    const handleEdit = (record) => {
        setPendingAction({ type: 'edit', data: record });
        setShowPasswordModal(true);
    };

    const handleDelete = (id) => {
        setPendingAction({ type: 'delete', data: id });
        setShowPasswordModal(true);
    };

    const executeAction = async () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'edit') {
            const record = pendingAction.data;
            setFormData({
                car_id: record.car_id,
                liters: record.liters.toString(),
                value: record.value.toString(),
                km: record.km.toString(),
            });
            setReceiptPreview(record.receipt_photo || '');
            setEditingId(record.id);
            setShowHistory(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (pendingAction.type === 'delete') {
            try {
                await deleteFuelRecord(pendingAction.data);
                alert('Registro excluído com sucesso!');
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }

        setPendingAction(null);
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
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <FuelIcon className="text-primary" />
                        Combustível & Manutenção
                    </h2>
                    <p className="text-muted-foreground">Acompanhe suas despesas e o estado do veículo.</p>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                >
                    {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                </button>
            </header>

            <form onSubmit={handleSubmit} className="glass-morphism p-8 rounded-2xl space-y-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold">
                    {editingId ? 'Editar Abastecimento' : 'Novo Abastecimento'}
                </h3>

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
                                <div className="flex gap-2 justify-center mt-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPreviewImage(receiptPreview);
                                        }}
                                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        Ver Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setReceiptPreview('');
                                            setReceiptFile(null);
                                        }}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Remover
                                    </button>
                                </div>
                                <p className="text-xs text-primary font-bold mt-2">Clique na área para alterar</p>
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

                <div className="flex gap-3">
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ car_id: '', liters: '', value: '', km: '' });
                                setReceiptFile(null);
                                setReceiptPreview('');
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-medium text-white transition-all"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 accent-gradient py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                        <FuelIcon size={20} />
                        <span>{editingId ? 'ATUALIZAR' : 'REGISTRAR'} ABASTECIMENTO</span>
                    </button>
                </div>
            </form>

            {showHistory && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Histórico de Abastecimentos</h3>
                    {fuelRecords.length > 0 ? (
                        <div className="grid gap-4">
                            {fuelRecords.map((record) => {
                                const car = cars.find(c => c.id === record.car_id);
                                return (
                                    <div key={record.id} className="glass-morphism p-6 rounded-2xl border-l-4 border-green-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-green-500/10 rounded-xl">
                                                    <FuelIcon className="text-green-500" size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{car?.model || 'Veículo'}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {format(new Date(record.date), "dd/MM/yyyy HH:mm")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-green-500">R$ {parseFloat(record.value).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{record.liters}L • {record.km}km</p>
                                            </div>
                                        </div>

                                        {record.receipt_photo && (
                                            <div className="mb-4">
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Comprovante</p>
                                                <div className="relative group/img">
                                                    <img
                                                        src={record.receipt_photo}
                                                        alt="Comprovante"
                                                        className="max-h-48 rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => setPreviewImage(record.receipt_photo)}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <Eye className="text-white" size={32} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-3 bg-white/5 rounded-xl hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-morphism rounded-2xl">
                            <FuelIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Nenhum abastecimento registrado ainda.</p>
                        </div>
                    )}
                </div>
            )}

            <AdminPasswordModal
                isOpen={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    setPendingAction(null);
                }}
                onSuccess={executeAction}
                title="Autorização Necessária"
            />

            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title="Preview do Comprovante"
            />
        </div>
    );
};

export default Fuel;
