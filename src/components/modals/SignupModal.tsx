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

interface SignupModalProps {
  onClose: () => void;
}

/**
 * @deprecated
 * @param onClose
 * @constructor
 */
export default function SignupModal({ onClose }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { openModal } = useModalStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('회원가입 성공:', { email, password });
      onClose();
    } catch (err) {
      setError('회원가입에 실패했습니다.');
      console.error('회원가입 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    openModal('login');
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>회원가입</AlertDialogTitle>
          <AlertDialogDescription>새 계정을 생성하세요</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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

          <div>
            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
            <Input
              type="password"
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              required
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </div>
        </form>

        <div className="border-t pt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={handleLoginClick}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            로그인
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
