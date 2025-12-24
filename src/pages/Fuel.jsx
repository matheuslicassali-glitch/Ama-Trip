import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Fuel as FuelIcon, Receipt, CheckCircle, Eye, X, Edit2, Trash2, Calendar, Car, Printer } from 'lucide-react';
import { format } from 'date-fns';
import AdminPasswordModal from '../components/AdminPasswordModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

const Fuel = () => {
    const { cars, fuelRecords, addFuelRecord, updateFuelRecord, deleteFuelRecord, loading, uploadImage } = useAppContext();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        car_id: '',
        liters: '',
        value: '',
        km: '',
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

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
        // Upload foto do comprovante se existir um novo arquivo
        if (receiptFile) {
            try {
                receiptUrl = await uploadImage(receiptFile, 'fuel-receipts');
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert(`Erro ao fazer upload da foto do comprovante: ${error.message}. Verifique se o bucket 'fuel-receipts' existe.`);
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

            setFormData({ car_id: '', liters: '', value: '', km: '' });
            setReceiptFile(null);
            setReceiptPreview('');
            setIsCreating(false);
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
            setIsCreating(true);
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
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <FuelIcon className="text-primary" />
                        Combustível & Manutenção
                    </h2>
                    <p className="text-muted-foreground">Acompanhe suas despesas e o estado do veículo.</p>
                </div>
                <button
                    onClick={() => {
                        if (isCreating) {
                            setIsCreating(false);
                            setEditingId(null);
                            setFormData({ car_id: '', liters: '', value: '', km: '' });
                            setReceiptFile(null);
                            setReceiptPreview('');
                        } else {
                            setIsCreating(true);
                        }
                    }}
                    className="accent-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    {isCreating ? 'CANCELAR' : 'NOVO ABASTECIMENTO'}
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleSubmit} className="glass-morphism p-8 rounded-2xl space-y-6 animate-in slide-in-from-top-4 print:hidden max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold mb-4">
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

                    <button
                        type="submit"
                        className="w-full bg-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"
                    >
                        <CheckCircle size={20} />
                        <span>{editingId ? 'ATUALIZAR' : 'REGISTRAR'} ABASTECIMENTO</span>
                    </button>
                </form>
            )}

            <div className="grid gap-6">
                {fuelRecords.length > 0 ? (
                    fuelRecords.map((record) => {
                        const car = cars.find(c => c.id === record.car_id);
                        return (
                            <div key={record.id} className="glass-morphism p-6 rounded-2xl border-l-4 border-green-500 hover:bg-white/10 transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                                ABAST #{(record.id.substring(0, 5)).toUpperCase()}
                                            </span>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Calendar size={14} className="mr-2" />
                                                {format(new Date(record.date), "dd/MM/yyyy HH:mm")}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Veículo</p>
                                                <p className="text-lg font-bold flex items-center gap-2">
                                                    <Car size={16} className="text-primary" />
                                                    {car?.model || 'Veículo'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Valor Total</p>
                                                <p className="text-lg font-bold text-green-500">
                                                    R$ {parseFloat(record.value).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Litros</p>
                                                <p className="text-sm font-mono">{record.liters} L</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Quilometragem</p>
                                                <p className="text-sm font-mono">{record.km} km</p>
                                            </div>
                                        </div>

                                        {record.receipt_photo && (
                                            <div className="mt-4">
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Comprovante Anexado</p>
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

                                        <div className="flex gap-2 print:hidden mt-4">
                                            <button
                                                onClick={() => window.print()}
                                                className="p-3 bg-white/5 rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                                                title="Imprimir"
                                            >
                                                <Printer size={20} />
                                            </button>
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
                                </div>

                                {/* Print Version of the Card */}
                                <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-[1000]">
                                    <div className="border-2 border-black p-8 h-full flex flex-col">
                                        {/* Header */}
                                        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
                                            <div>
                                                <h1 className="text-3xl font-black italic">AMA TRIP</h1>
                                                <p className="text-xs uppercase tracking-tighter">Controle de Abastecimento</p>
                                            </div>
                                            <div className="text-right">
                                                <h2 className="text-2xl font-bold">COMPROVANTE</h2>
                                                <p className="font-mono text-sm">#{record.id.substring(0, 8).toUpperCase()}</p>
                                                <p className="text-xs mt-1">{format(new Date(record.date), "dd/MM/yyyy HH:mm")}</p>
                                            </div>
                                        </div>

                                        {/* Main Info */}
                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Veículo</p>
                                                <p className="text-xl font-bold">{car?.model}</p>
                                                <p className="text-sm text-gray-600">{car?.plate}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Valor Total</p>
                                                <p className="text-2xl font-bold text-black border-2 border-black inline-block px-3 py-1">
                                                    R$ {parseFloat(record.value).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 mb-8 bg-gray-50 p-4 border border-gray-200">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Litros Abastecidos</p>
                                                <p className="font-mono text-lg">{record.liters} L</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Quilometragem (Odometer)</p>
                                                <p className="font-mono text-lg">{record.km} km</p>
                                            </div>
                                        </div>

                                        {/* Receipt Photo */}
                                        <div className="flex-1 flex flex-col">
                                            <p className="text-[10px] uppercase font-bold border-b border-black mb-4">Comprovante Fiscal / Recibo</p>
                                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 p-4">
                                                {record.receipt_photo ? (
                                                    <img
                                                        src={record.receipt_photo}
                                                        alt="Recibo"
                                                        className="max-h-[500px] w-auto max-w-full object-contain shadow-lg"
                                                    />
                                                ) : (
                                                    <p className="text-sm uppercase text-gray-400">Nenhum comprovante anexado</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-8 text-[8px] text-gray-400 text-center uppercase tracking-widest">
                                            Registro Digital - Ama Trip
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 glass-morphism rounded-2xl border-dashed border-2 border-white/10">
                        <FuelIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-medium text-muted-foreground">Nenhum Abastecimento</h3>
                        <p className="text-sm text-muted-foreground/60 mt-1">Clique em 'Novo Abastecimento' para começar.</p>
                    </div>
                )}
            </div>

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

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    /* Show only the printed Fuel version */
                    div.fixed.inset-0.bg-white { visibility: visible !important; display: block !important; position: static !important; }
                    div.fixed.inset-0.bg-white * { visibility: visible !important; }
                }
            ` }} />
        </div>
    );
};

export default Fuel;
