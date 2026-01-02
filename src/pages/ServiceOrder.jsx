import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { ClipboardList, Building2, UserCircle, Briefcase, Calendar, CheckCircle, Printer, FileText, Eye, Image as ImageIcon, Trash2, Edit, Camera } from 'lucide-react';
import { format } from 'date-fns';
import ImagePreviewModal from '../components/ImagePreviewModal';
import AdminPasswordModal from '../components/AdminPasswordModal';

const ServiceOrder = () => {
    const { serviceOrders, addServiceOrder, updateServiceOrder, deleteServiceOrder, loading, user } = useAppContext();
    const [isCreating, setIsCreating] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        requesting_company: '',
        client_name: '',
        description: '',
        photo_url: '', // Store the URL (either base64/blob for now or remote url)
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null); // { type: 'delete'|'edit', payload: any }

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo_url: reader.result });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let finalPhotoUrl = formData.photo_url;

            // If a new file is active, upload it to Supabase
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('service-orders')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('service-orders')
                    .getPublicUrl(filePath);

                finalPhotoUrl = data.publicUrl;
            }

            if (editingId) {
                await updateServiceOrder(editingId, { ...formData, photo_url: finalPhotoUrl });
                alert('Ordem de Serviço atualizada com sucesso!');
                setEditingId(null);
            } else {
                await addServiceOrder({ ...formData, photo_url: finalPhotoUrl });
            }

            setFormData({ requesting_company: '', client_name: '', description: '', photo_url: '' });
            setFile(null);
            setIsCreating(false);
        } catch (error) {
            alert('Erro ao salvar Ordem de Serviço: ' + error.message);
        }
    };

    const handleEditClick = (os) => {
        setActionToConfirm({ type: 'edit', payload: os });
        setShowAdminModal(true);
    };

    const handleDeleteClick = (id) => {
        setActionToConfirm({ type: 'delete', payload: id });
        setShowAdminModal(true);
    };

    const onAdminSuccess = async () => {
        if (actionToConfirm?.type === 'edit') {
            const os = actionToConfirm.payload;
            setFormData({
                requesting_company: os.requesting_company,
                client_name: os.client_name,
                description: os.description,
                photo_url: os.photo_url || ''
            });
            setEditingId(os.id);
            setIsCreating(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (actionToConfirm?.type === 'delete') {
            try {
                await deleteServiceOrder(actionToConfirm.payload);
                alert('Ordem de Serviço removida.');
            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Erro ao deletar OS.");
            }
        }
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
                        <ClipboardList className="text-primary" />
                        Ordens de Serviço
                    </h2>
                    <p className="text-muted-foreground">Gestão de solicitações e ordens de trabalho.</p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(!isCreating);
                        if (isCreating && editingId) {
                            setEditingId(null);
                            setFormData({ requesting_company: '', client_name: '', description: '', photo_url: '' });
                        }
                    }}
                    className="accent-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    {isCreating ? 'CANCELAR' : 'NOVA ORDEM DE SERVIÇO'}
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleSubmit} className="glass-morphism p-8 rounded-2xl space-y-6 animate-in slide-in-from-top-4 print:hidden max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold mb-4">Dados da Solicitação</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Empresa Solicitante</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Nome da empresa"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                                    value={formData.requesting_company}
                                    onChange={(e) => setFormData({ ...formData, requesting_company: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nome do Cliente / Final</label>
                            <div className="relative">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Nome do cliente"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Descrição do Serviço</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Descreva o que será realizado..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-white"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Anexar Foto da Ordem / Documento</label>
                        {formData.photo_url ? (
                            <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 group">
                                <img src={formData.photo_url} alt="Preview" className="w-full h-64 object-contain bg-black/50" />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => { setFormData({ ...formData, photo_url: '' }); setFile(null); }}
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
                        className="w-full bg-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"
                    >
                        <CheckCircle size={20} />
                        <span>{editingId ? 'SALVAR ALTERAÇÕES' : 'GERAR ORDEM DE SERVIÇO'}</span>
                    </button>
                </form>
            )}

            <div className="grid gap-6">
                {serviceOrders.length > 0 ? (
                    serviceOrders.map((os) => (
                        <div key={os.id} className="glass-morphism p-6 rounded-2xl border-l-4 border-primary hover:bg-white/10 transition-all group overflow-hidden relative">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            OS #{(os.id.substring(0, 5)).toUpperCase()}
                                        </span>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar size={14} className="mr-2" />
                                            {format(new Date(os.created_at), "dd/MM/yyyy HH:mm")}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Empresa Solicitante</p>
                                            <p className="text-lg font-bold flex items-center gap-2">
                                                <Building2 size={16} className="text-primary" />
                                                {os.requesting_company}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Cliente / Destinatário</p>
                                            <p className="text-lg font-bold flex items-center gap-2">
                                                <UserCircle size={16} className="text-blue-400" />
                                                {os.client_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Descrição do Serviço</p>
                                        <p className="text-sm leading-relaxed text-foreground/90">{os.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-end">
                                    <button
                                        onClick={() => window.print()}
                                        className="p-3 bg-white/5 rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all print:hidden"
                                        title="Imprimir OS"
                                    >
                                        <Printer size={20} />
                                    </button>
                                    {os.photo_url && (
                                        <button
                                            onClick={() => setPreviewImage(os.photo_url)}
                                            className="p-3 bg-white/5 rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all mt-2"
                                            title="Ver Foto"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    )}

                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleEditClick(os)}
                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(os.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${os.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'} uppercase font-bold mt-2 inline-block`}>
                                            {os.status === 'pending' ? 'Pendente' : 'Finalizado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Print Version of the Card (Hidden on Screen) */}
                            <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-[1000]">
                                <div className="border-2 border-black p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                                        <div>
                                            <h1 className="text-3xl font-black italic">AMA TRIP</h1>
                                            <p className="text-xs uppercase tracking-tighter">Gestão Logística e Transportes</p>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-2xl font-bold">ORDEM DE SERVIÇO</h2>
                                            <p className="font-mono text-sm">Nº {(os.id.substring(0, 8)).toUpperCase()}</p>
                                            <p className="text-xs mt-1">{format(new Date(os.created_at), "dd/MM/yyyy HH:mm")}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 mb-8">
                                        <div className="space-y-4">
                                            <div className="border-b border-black pb-2">
                                                <p className="text-[10px] uppercase font-bold">Empresa Solicitante</p>
                                                <p className="text-lg font-bold">{os.requesting_company}</p>
                                            </div>
                                            <div className="border-b border-black pb-2">
                                                <p className="text-[10px] uppercase font-bold">Cliente / Destino</p>
                                                <p className="text-lg font-bold">{os.client_name}</p>
                                            </div>
                                            {/* Status Block Removed for Print View */}
                                        </div>
                                        <div className="border-2 border-black p-4 bg-gray-50 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold mb-2">Descrição do Serviço / Notas</p>
                                                <p className="text-sm">{os.description}</p>
                                            </div>
                                            <div className="mt-4 border-t border-dashed border-gray-300 pt-2 text-center">
                                                {os.photo_url ? (
                                                    <div className="mt-2">
                                                        <p className="text-[8px] uppercase text-gray-400 mb-1">Foto Anexada</p>
                                                        <img
                                                            src={os.photo_url}
                                                            alt="Anexo da OS"
                                                            className="max-h-48 mx-auto object-contain border border-gray-200 rounded"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-[8px] uppercase text-gray-400">Anexo de Imagem vinculado ao registro digital</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-10 text-center text-xs">
                                        <div className="border-t border-black pt-4">
                                            <p className="font-bold">Assinatura Solicitante</p>
                                            <p className="text-[8px] mt-1 italic">Autorizo a execução do serviço</p>
                                        </div>
                                        <div className="border-t border-black pt-4">
                                            <p className="font-bold">Assinatura Prestador / Motorista</p>
                                            <p className="text-[8px] mt-1 italic">Serviço concluído conforme acima</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-[8px] text-gray-400 text-center uppercase tracking-widest">
                                        AMA TRIP - Gerado eletronicamente em {new Date().toLocaleString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 glass-morphism rounded-2xl border-dashed border-2 border-white/10">
                        <ClipboardList size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-medium text-muted-foreground">Nenhuma Ordem de Serviço</h3>
                        <p className="text-sm text-muted-foreground/60 mt-1">Clique em 'Nova Ordem de Serviço' para começar.</p>
                    </div>
                )}
            </div >

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    /* Show only the printed OS version */
                    div.fixed.inset-0.bg-white { visibility: visible !important; display: block !important; position: static !important; }
                    div.fixed.inset-0.bg-white * { visibility: visible !important; }
                }
            ` }} />

            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title="Visualizar Ordem de Serviço"
            />
            <AdminPasswordModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onSuccess={onAdminSuccess}
                title={actionToConfirm?.type === 'delete' ? "Confirmar Exclusão" : "Confirmar Edição"}
            />
        </div>
    );
};

export default ServiceOrder;
