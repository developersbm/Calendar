import React from 'react'
interface BellModal {
    isOpen: boolean;
    onClose: () => void;
}
const BellModal: React.FC<BellModal> = ({ isOpen }) => {

    if (!isOpen) return null;

    return (
    <div>BellNotifications</div>
    )
}
