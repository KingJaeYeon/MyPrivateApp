import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModalStore } from '@/store/modalStore.ts';

interface LoginModalProps {
  onClose: () => void;
}

/**
 * @deprecated
 * @param onClose
 * @constructor
 */
export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { openModal } = useModalStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API 호출 예시
      // const response = await loginApi(email, password);

      // 임시로 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 로그인 성공
      console.log('로그인 성공:', { email, password });
      onClose();
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error('로그인 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    // 회원가입 모달로 전환
    openModal('signup');
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>로그인</AlertDialogTitle>
          <AlertDialogDescription>계정으로 로그인하세요</AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 이메일 입력 */}
          <div>
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="mt-1"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="mt-1"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <div className="border-t pt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={handleSignupClick}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            회원가입
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
