import React, {useEffect, useRef} from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    className?: string;
    children?: any;
    isDisabled?: boolean;
}

const INITIAL_PROPS: ModalProps = {
    isOpen: false,
    title: '',
    className: '',
    children: '',
    isDisabled: false,
};

const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, className, children, isDisabled}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleOverlayClick = (event: MouseEvent) => {
        if (!onClose || isDisabled) return;
        if (event.target instanceof HTMLElement && modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOverlayClick);
        return () => {
            document.removeEventListener('mousedown', handleOverlayClick);
        };
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`modal-overlay ${className} active`}>
            <div className="modal__content" ref={modalRef}>
                <button
                    type="button"
                    className="modal-close icon-x"
                    disabled={isDisabled}
                    onClick={onClose}
                />
                <div className="modal-title">{title}</div>
                {children}
            </div>
        </div>
    );
};

Modal.defaultProps = INITIAL_PROPS;

export default Modal;
