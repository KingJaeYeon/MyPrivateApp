import { ModalType, useModalStore } from '@/store/modalStore';
import LoginModal from './modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal.tsx';
import ConfirmModal from '@/components/modals/ConfirmModal.tsx';
import AlertModal from '@/components/modals/AlertModal.tsx';

export default function ModalRenderer() {
  const { type, isOpen, closeModal, data } = useModalStore();

  if (!isOpen || !type) {
    return null;
  }

  const modals: Record<ModalType, any> = {
    login: <LoginModal onClose={closeModal} />,
    signup: <SignupModal onClose={closeModal} />,
    confirm: <ConfirmModal onClose={closeModal} data={data} />,
    alert: <AlertModal onClose={closeModal} data={data} />,
  };

  return modals[type] || null;
}
