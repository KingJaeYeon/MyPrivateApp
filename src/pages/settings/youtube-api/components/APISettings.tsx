import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { CheckCircle2, Key } from 'lucide-react';
import { Label } from '@/components/ui/label.tsx';
import {
  CancelButton,
  ConnectButton,
  DeleteButton,
  EditButton,
} from '@/pages/settings/youtube-api/components/api-buttons.tsx';
import React, { useState } from 'react';
import useSettingStore from '@/store/useSettingStore.ts';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx';
import { IconEyeOff, IconEyeOn } from '@/assets/svg';

export default function APISettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const { data } = useSettingStore();
  const hasApiKey = Boolean(data.youtube.apiKey);
  const [inputType, setInputType] = useState<string>('password');

  const getValue = () => {
    if (hasApiKey && !isEditing) return data.youtube.apiKey;
    return editValue;
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <CardTitle>YouTube Data API v3</CardTitle>
        </div>
        <CardDescription>
          YouTube 채널 및 영상 정보를 가져오기 위한 API Key를 설정하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <InputGroup>
              <InputGroupInput
                id="apiKey"
                readOnly={hasApiKey && !isEditing}
                value={getValue()}
                type={inputType}
                placeholder="AIzaSyDDe44x6EkzF2V0QOD1gecv929QSjD0dS4"
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono text-sm"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Copy"
                  title="show"
                  size="icon-xs"
                  onClick={() => {
                    setInputType((prev) => (prev === '' ? 'password' : ''));
                  }}
                >
                  {inputType === 'password' ? <IconEyeOff /> : <IconEyeOn />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <ConnectionStatus
              isConnect={hasApiKey}
              setIsEditing={setIsEditing}
              setEditValue={setEditValue}
              editValue={editValue}
              isEditing={isEditing}
            />
          </div>
          {hasApiKey && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>API Key가 설정되었습니다</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p
            onClick={() =>
              window.electronAPI.openExternal('https://console.cloud.google.com/apis/credentials')
            }
            className="inline cursor-pointer text-sm text-blue-600 hover:underline"
          >
            → Google Cloud Console에서 API Key 발급받기
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionStatus({
  isConnect,
  isEditing,
  setIsEditing,
  setEditValue,
  editValue,
}: {
  isConnect: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setEditValue: React.Dispatch<React.SetStateAction<string>>;
  editValue: string;
}) {
  if (isConnect && !isEditing) {
    return (
      <div className="flex gap-2">
        <EditButton setIsEditing={setIsEditing} setEditValue={setEditValue} />
        <DeleteButton />
      </div>
    );
  }

  if (isConnect && isEditing) {
    return (
      <div className="flex gap-2">
        <ConnectButton editValue={editValue} setIsEditing={setIsEditing} />
        <CancelButton setIsEditing={setIsEditing} setEditValue={setEditValue} />
      </div>
    );
  }

  return <ConnectButton editValue={editValue} setIsEditing={setIsEditing} />;
}
