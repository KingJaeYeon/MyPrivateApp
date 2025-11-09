import { ModalType, useModalStore } from '@/store/modalStore';
import LoginModal from './modals/LoginModal';
import SignupModal from '@/components/modals/SignupModal.tsx';
import ConfirmModal from '@/components/modals/ConfirmModal.tsx';
import AlertModal from '@/components/modals/AlertModal.tsx';
import FileResultModal from '@/components/modals/FileResultModal.tsx';
import TagChooserModal from '@/components/modals/TagChooserModal.tsx';
import { animated, config, useTransition } from '@react-spring/web';
import CoffeModal from '@/components/modals/CoffeModal.tsx';

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
    tagChooser: <TagChooserModal onClose={closeModal} data={data} />,
    coffee: <CoffeModal onClose={closeModal} />,
  };

  return transitions((style, item) =>
    item ? <animated.div style={style}>{modals[item]}</animated.div> : null
  );
}

// export function SomeComponent() {
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
//       <button onClick={() => openModal('alert', 'YouTube API Key 필요')}>알림</button>
//
//       <button onClick={() => toast.error('YouTube API Key 필요')}>toast</button>
//       <button onClick={() => alert('YouTube API 키를')}>toast</button>
//     </div>
//   );
// }
