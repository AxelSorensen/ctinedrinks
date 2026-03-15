"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  showEmailModal: boolean;
  setShowEmailModal: (open: boolean) => void;
  hasJoined: boolean;
  setHasJoined: (joined: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  return (
    <ModalContext.Provider
      value={{ isModalOpen, setIsModalOpen, showEmailModal, setShowEmailModal, hasJoined, setHasJoined }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
