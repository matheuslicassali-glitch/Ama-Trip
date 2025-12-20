import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ClipboardList, Building2, UserCircle, Briefcase, Calendar, CheckCircle, Printer, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ServiceOrder = () => {
    const { serviceOrders, addServiceOrder, loading, user } = useAppContext();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        requesting_company: '',
        client_name: '',
        description: '',
        contact_info: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addServiceOrder(formData);
            setFormData({ requesting_company: '', client_name: '', description: '', contact_info: '' });
            setIsCreating(false);
        } catch (error) {
            alert('Erro ao criar Ordem de Serviço: ' + error.message);
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
                    onClick={() => setIsCreating(!isCreating)}
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
                        <label className="text-sm font-medium text-muted-foreground">Contato / Telefone</label>
                        <input
                            type="text"
                            placeholder="(21) 99999-9999"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                            value={formData.contact_info}
                            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"
                    >
                        <CheckCircle size={20} />
                        <span>GERAR ORDEM DE SERVIÇO</span>
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
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">{os.contact_info || 'Sem contato'}</p>
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
                                            <div className="border-b border-black pb-2">
                                                <p className="text-[10px] uppercase font-bold">Contato</p>
                                                <p className="text-lg font-bold">{os.contact_info || '---'}</p>
                                            </div>
                                        </div>
                                        <div className="border-2 border-black p-4 bg-gray-50">
                                            <p className="text-[10px] uppercase font-bold mb-2">Descrição do Serviço / Notas</p>
                                            <p className="text-sm">{os.description}</p>
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
            </div>

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
        </div>
    );
};

export default ServiceOrder;
