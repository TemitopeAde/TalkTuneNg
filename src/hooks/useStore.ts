import { ReactNode } from "react";
import { create, createStore } from "zustand";

type ModalType = "" | "modal" | "logout" | "payment";
type ModalState = {
  isOpen: boolean;
  type: ModalType | null;
  data: ReactNode;
  onOpen: (type: ModalType, data: ReactNode) => void;
  onClose: () => void;
};

export const useStore = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  data: undefined,
  onOpen: (type: ModalType, data: ReactNode) =>
    set({
      isOpen: true,
      data: data,
      type,
    }),
  onClose: () =>
    set({
      isOpen: false,
      data: undefined,
      type: null,
    }),
}));
