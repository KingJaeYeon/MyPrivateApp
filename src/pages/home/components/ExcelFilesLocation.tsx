import useSettingStore from '@/store/useSettingStore.ts';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { getOrderedColumns } from '@/lib/utils.ts';

export function ExcelFilesLocation() {
  const [loading, setLoading] = useState<boolean>(false);
  const { location, name } = useSettingStore((r) => r.data.folder);
  const {
    data: { excel, folder, hasFile },
    updateIn,
  } = useSettingStore();

  async function handleClick() {
    const result = await window.electronAPI.pickFolder();
    if (!result) return;

    await updateIn('folder', {
      ...folder,
      location: result,
    });
  }

  async function generateFiles() {
    try {
      setLoading(true);
      const isAllFill =
        !!name.channel &&
        !!name.tag &&
        !!name.progress &&
        !!name.english &&
        !!name.prompt &&
        !!name.reference &&
        !!name.result;
      if (!isAllFill) {
        alert('FileName Rule 먼저 체워 주세요.');
        return;
      }

      const { result, ...others } = name;
      const files = Object.values(others);
      const allXlsx = files.every((f) => {
        if (/[\\/]/.test(f)) return false;
        return /\.xlsx?$/.test(f.toLowerCase());
      });

      const resultCheck = /^\//.test(result) || /\./.test(result);

      if (!allXlsx) {
        alert('result를 제외한 모든 파일명이 .xlsx, .xls 확장자를 가져야 합니다.');
        return;
      }
      if (resultCheck) {
        alert('result는 맨앞에 /와 . 제외해야합니다.');
        return;
      }

      const path = {
        tag: `${location}/${name.tag}`,
        channel: `${location}/${name.channel}`,
        english: `${location}/${name.english}`,
        prompt: `${location}/${name.prompt}`,
        reference: `${location}/${name.reference}`,
        progress: `${location}/${name.progress}`,
        result: `${location}/${name.result}`,
      };

      const hasTag = await window.fsApi.exists(path.tag);
      const hasChannel = await window.fsApi.exists(path.channel);
      const hasEnglish = await window.fsApi.exists(path.english);
      const hasPrompt = await window.fsApi.exists(path.prompt);
      const hasReference = await window.fsApi.exists(path.reference);

      if (!hasTag) {
        const arr = getOrderedColumns(excel, 'tag', 'column');
        await window.excelApi.create(path.tag, [arr]);
      }
      if (!hasChannel) {
        const arr = getOrderedColumns(excel, 'channel', 'column');
        await window.excelApi.create(path.channel, [arr]);
      }
      if (!hasEnglish) {
        const arr = getOrderedColumns(excel, 'english', 'column');
        await window.excelApi.create(path.english, [arr]);
      }
      if (!hasPrompt) {
        const arr = getOrderedColumns(excel, 'prompt', 'column');
        await window.excelApi.create(path.prompt, [arr]);
      }
      if (!hasReference) {
        const arr = getOrderedColumns(excel, 'reference', 'column');
        await window.excelApi.create(path.reference, [arr]);
      }

      const hasResultDic = await window.fsApi.exists(path.result.split('/')[1]);
      if (!hasResultDic) {
        await window.fsApi.ensureDir(path.result);
      }
      // const hasProgress = await window.fsApi.exists(`${location}/${name.progress}`)
      await updateIn('hasFile', true);
      alert('생성완료');
    } catch (e) {
      alert('오류발생');
    } finally {
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      <Label htmlFor="mode" className="min-w-[100px]">
        Location
      </Label>
      <Input
        className="h-8 w-[500px]"
        value={location}
        onClick={handleClick}
        placeholder={'폴더를 지정해주세요.'}
        readOnly
      />
      {location && (
        <Button
          variant={hasFile ? 'secondary' : 'destructive'}
          onClick={generateFiles}
          loading={loading}
        >
          Excel 생성
        </Button>
      )}
      <Button onClick={() => window.electronAPI.openFolder(location)}>폴더열기</Button>
    </React.Fragment>
  );
}
