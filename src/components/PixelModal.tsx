import React from "react";

type PixelModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export function PixelModal({ open, title, onClose, children, footer }: PixelModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-[92%] max-w-lg bg-white border-4 border-gray-800 shadow-[8px_8px_0_0_#1f2937]">
                {title && (
                    <div className="px-4 py-3 border-b-4 border-gray-800 bg-gray-100">
                        <h3 className="font-mono text-lg font-bold tracking-tight">{title}</h3>
                    </div>
                )}
                <div className="p-4">{children}</div>
                {footer && (
                    <div className="px-4 py-3 border-t-4 border-gray-800 bg-gray-50 flex items-center justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PixelModal;


