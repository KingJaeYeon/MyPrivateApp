import { ModalType, useModalStore } from '@/store/modalStore';
import LoginModal from './modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal.tsx';
import ConfirmModal from '@/components/modals/ConfirmModal.tsx';
import AlertModal from '@/components/modals/AlertModal.tsx';
import FileResultModal from '@/components/modals/FileResultModal.tsx';
import { AddChannelModal } from '@/components/modals/AddChannelModal.tsx';
import { useTransition, config, animated } from '@react-spring/web';

export default function ModalRenderer() {
  const { type, isOpen, closeModal, data, resultData } = useModalStore();

  const transitions = useTransition(isOpen && type ? type : null, {
    from: { opacity: 0, scale: 0.95 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.95 },
    config: config.gentle,
  });

  if (!isOpen || !type) {
    return null;
  }

  const modals: Record<ModalType, any> = {
    login: <LoginModal onClose={closeModal} />,
    signup: <SignupModal onClose={closeModal} />,
    confirm: <ConfirmModal onClose={closeModal} data={data} />,
    alert: <AlertModal onClose={closeModal} data={data} />,
    result: <FileResultModal onClose={closeModal} data={resultData} />,
    channel: <AddChannelModal onClose={closeModal} data={data} />,
  };

  return transitions((style, item) =>
    item ? <animated.div style={style}>{modals[item]}</animated.div> : null
  );
}

// function SomeComponent() {
//   const { openModal } = useModalStore();
//
//   return (
//     <div className="space-y-4">
//       {/* 로그인 모달 */}
//       <button onClick={() => openModal('login')}>로그인</button>
//
//       {/* 회원가입 모달 */}
//       <button onClick={() => openModal('signup')}>회원가입</button>
//
//       {/* 확인 모달 */}
//       <button
//         onClick={() =>
//           openModal('confirm', {
//             title: '삭제 확인',
//             message: '정말 삭제하시겠습니까?',
//             cancelText: '취소',
//             confirmText: '삭제',
//             onConfirm: () => {
//               console.log('삭제됨');
//               // 삭제 API 호출
//             },
//           })
//         }
//       >
//         삭제
//       </button>
//
//       {/* 알림 모달 */}
//       <button
//         onClick={() =>
//           openModal('alert', {
//             title: '알림',
//             message: '저장되었습니다.',
//             buttonText: '확인',
//           })
//         }
//       >
//         알림
//       </button>
//     </div>
//   );
// }
