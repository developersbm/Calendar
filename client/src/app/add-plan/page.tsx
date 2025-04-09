"use client";

import React, { useState } from "react";
import CelebrationPlanModal from "@/components/CelebrationPlanModal/page";

const AddPlanPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const handleClose = () => {
    setIsModalOpen(false);
    // Optionally redirect to another page
    window.history.back();
  };

  const handlePlanCreated = () => {
    // Handle successful plan creation
    handleClose();
  };

  return (
    <CelebrationPlanModal
      isOpen={isModalOpen}
      onClose={handleClose}
      userId={userId}
      onPlanCreated={handlePlanCreated}
    />
  );
};

export default AddPlanPage;