import React from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import { Trash2 } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    isDestructive = true,
    icon: Icon = Trash2 
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    <Icon size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-primary-950">{title}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-2">
                        {message}
                    </p>
                </div>
                <div className="pt-8 border-t border-gray-100 flex gap-4">
                    <Button variant="secondary" onClick={onClose} className="px-8 py-4">Cancel</Button>
                    <Button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className={`flex-1 py-4 font-black text-white border-transparent ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
