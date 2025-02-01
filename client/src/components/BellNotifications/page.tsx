import React from 'react'
interface BellModal {
    isOpen: boolean;
    onClose: () => void;
}
const Modal: React.FC<BellModal> = ({ isOpen, onClose}) => {

    if (!isOpen) return null;

    return (
    <div>BellNotifications</div>
    )
}
