import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, title = "Preview da Imagem" }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl w-full animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-white">
                        <ImageIcon size={24} />
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                    />
                </div>

                <p className="text-center text-white/60 text-sm mt-4">
                    Clique fora da imagem para fechar
                </p>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
