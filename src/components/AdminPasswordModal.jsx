import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

const AdminPasswordModal = ({ isOpen, onClose, onSuccess, title = "Senha do Administrador" }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Senha do administrador (mesma do login)
        if (password === '123') {
            setError('');
            setPassword('');
            onSuccess();
            onClose();
        } else {
            setError('Senha incorreta!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="glass-morphism p-8 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Lock className="text-red-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <button
                        onClick={() => {
                            setPassword('');
                            setError('');
                            onClose();
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                    Esta ação requer permissões de administrador. Digite a senha para continuar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">
                            Senha do Administrador
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Digite a senha"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setPassword('');
                                setError('');
                                onClose();
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-medium transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPasswordModal;
