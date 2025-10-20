import useSettingStore from '@/store/useSettingStore.ts';
import { useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  CancelButton,
  ConnectButton,
  DeleteButton,
  EditButton,
} from '@/pages/home/components/api-buttons.tsx';
import { ExcelFilesLocation } from '@/pages/home/components/ExcelFilesLocation.tsx';
import { FileNameRule } from '@/pages/home/components/FileNameRule.tsx';
import { SavedResult } from '@/pages/home/components/SavedResult.tsx';
import { Button } from '@/components/ui/button.tsx';
import QuotaReset from '@/pages/home/components/QuotaReset.tsx';

export type ApiType = 'youtubeApiKey';

export function Home() {
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);
  const [editValues, setEditValues] = useState({ youtubeApiKey: '' });
  const [isEditing, setIsEditing] = useState({ youtubeApiKey: false });
  const hasYoutubeApiKey = Boolean(youtubeApiKey);

  const getValue = (type: ApiType) => {
    const isConnected = Boolean(youtubeApiKey);
    const isCurrentlyEditing = isEditing[type];

    if (isConnected && !isCurrentlyEditing) {
      return youtubeApiKey;
    }
    return editValues[type];
  };

  const onChange = (value: string, key: ApiType) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const ConnectionStatus = ({ type, isConnect }: { type: ApiType; isConnect: boolean }) => {
    if (isConnect && !isEditing[type]) {
      return (
        <div className="flex gap-2">
          <EditButton type={type} setIsEditing={setIsEditing} setEditValues={setEditValues} />
          <DeleteButton />
        </div>
      );
    }

    if (isConnect && isEditing[type]) {
      return (
        <div className="flex gap-2">
          <ConnectButton type={type} editValues={editValues} setIsEditing={setIsEditing} />
          <CancelButton type={type} setIsEditing={setIsEditing} setEditValues={setEditValues} />
        </div>
      );
    }

    return <ConnectButton type={type} editValues={editValues} setIsEditing={setIsEditing} />;
  };

  return (
    <div className={'flex w-full flex-1 flex-col gap-6 p-4'}>
      <div className={'flex w-full max-w-[800px] flex-col gap-3'}>
        <div className="flex w-full items-center gap-4">
          <Label htmlFor="mode" className="min-w-[100px]">
            YouTube API
          </Label>
          <Input
            id="keyword"
            readOnly={Boolean(youtubeApiKey) && !isEditing['youtubeApiKey']}
            value={getValue('youtubeApiKey')}
            placeholder="입력해주세요."
            onChange={(e) => onChange(e.target.value, 'youtubeApiKey')}
            className="h-8 w-[500px]"
          />
          <ConnectionStatus type={'youtubeApiKey'} isConnect={hasYoutubeApiKey} />
        </div>
        <div className="flex w-full items-center gap-4">
          <ExcelFilesLocation />
        </div>
      </div>
      <SavedResult />
      <div className="flex w-full flex-col gap-4">
        <Label htmlFor="mode" className="min-w-[100px]">
          Buttons
        </Label>
        <div className={'flex flex-col'}>
          <div className={'flex flex-1'}>
            <FileNameRule />
            <QuotaReset />
            {Array.from({ length: 6 }, (_, i) => (
              <Button
                key={`home-${i}`}
                className={'flex w-full flex-1 rounded-none border'}
                variant={'secondary'}
              >{`home-${i}`}</Button>
            ))}
          </div>
          <div className={'flex flex-1'}>
            {Array.from({ length: 8 }, (_, i) => {
              return (
                <Button
                  key={'home-' + i + 8}
                  className={'flex w-full flex-1 rounded-none border'}
                  variant={'secondary'}
                ></Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
