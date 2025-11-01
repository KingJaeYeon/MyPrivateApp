import useSettingStore from '@/store/useSettingStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { FileNameRuleModal } from '@/pages/settings/LocationFile/components/FileNameRuleModal.tsx';
import { SheetKeys } from '../../../../../electron/docs.schema.ts';

export function FileGenerator() {
  const {
    data: { folder },
    updateIn,
  } = useSettingStore();
  const { openModal } = useModalStore();

  const handleCreateExcel = async () => {
    const { name, location } = folder;
    if (!location) {
      openModal('alert', '폴더를 먼저 선택하세요');
      return;
    }
    // Excel 생성 로직
    try {
      const isAllFill =
        !!name.channel &&
        !!name.tag &&
        !!name.progress &&
        !!name.verbs &&
        !!name.patterns &&
        !!name.concepts &&
        !!name.expressions &&
        !!name.prompt &&
        !!name.reference &&
        !!name.result;

      if (!isAllFill) {
        openModal('alert', 'FileName Rule 먼저 체워 주세요.');
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
        toast.error('result를 제외한 모든 파일명이 .xlsx, .xls 확장자를 가져야 합니다.');
        return;
      }
      if (resultCheck) {
        toast.error('result는 맨앞에 /와 . 제외해야합니다.');
        return;
      }
      const path = {
        tag: `${location}/${folder.name.tag}`,
        channel: `${location}/${folder.name.channel}`,
        channelHistory: `${location}/${folder.name.channelHistory}`,
        verbs: `${location}/${folder.name.verbs}`,
        patterns: `${location}/${folder.name.patterns}`,
        concepts: `${location}/${folder.name.concepts}`,
        expressions: `${location}/${folder.name.expressions}`,
        prompt: `${location}/${folder.name.prompt}`,
        reference: `${location}/${folder.name.reference}`,
        progress: `${location}/${folder.name.progress}`,
        result: `${location}/${folder.name.result}`,
      };

      const hasTag = await window.fsApi.exists(path.tag);
      const hasChannel = await window.fsApi.exists(path.channel);
      const hasChannelHistory = await window.fsApi.exists(path.channelHistory);
      const hasVerbs = await window.fsApi.exists(path.verbs);
      const hasPatterns = await window.fsApi.exists(path.patterns);
      const hasConcepts = await window.fsApi.exists(path.concepts);
      const hasExpressions = await window.fsApi.exists(path.expressions);
      const hasPrompt = await window.fsApi.exists(path.prompt);
      const hasReference = await window.fsApi.exists(path.reference);

      if (!hasTag) {
        await window.excelApi.create(path.tag, [SheetKeys['tag']]);
      }
      if (!hasChannel) {
        await window.excelApi.create(path.channel, [SheetKeys['channel']]);
      }
      if (!hasChannelHistory) {
        await window.excelApi.create(path.channelHistory, [SheetKeys['channelHistory']]);
      }
      if (!hasVerbs) {
        await window.excelApi.create(path.verbs, [SheetKeys['verbs']]);
      }
      if (!hasPatterns) {
        await window.excelApi.create(path.patterns, [SheetKeys['patterns']]);
      }
      if (!hasConcepts) {
        await window.excelApi.create(path.concepts, [SheetKeys['concepts']]);
      }
      if (!hasExpressions) {
        await window.excelApi.create(path.expressions, [SheetKeys['expressions']]);
      }
      if (!hasPrompt) {
        await window.excelApi.create(path.prompt, [SheetKeys['prompt']]);
      }
      if (!hasReference) {
        await window.excelApi.create(path.reference, [SheetKeys['reference']]);
      }

      const hasResultDic = await window.fsApi.exists(path.result.split('/')[1]);
      if (!hasResultDic) {
        await window.fsApi.ensureDir(path.result);
      }
      // const hasProgress = await window.fsApi.exists(`${location}/${name.progress}`)
      await updateIn('hasFile', true);
      openModal('alert', 'Excel 파일이 생성되었습니다');
    } catch (e) {
      toast.error('오류발생: 다시 시도해주세요.');
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Excel 파일 관리</CardTitle>
        </div>
        <CardDescription>필요한 Excel 파일을 생성하거나 관리합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileNameRuleModal />
        <Button onClick={handleCreateExcel} disabled={!folder.location} className="w-full">
          Excel 파일 생성
        </Button>
        <div className="text-muted-foreground bg-muted rounded-lg p-3 text-xs">
          <p className="mb-2 font-medium">생성될 파일:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{folder.name.channel} - 채널 정보</li>
            <li>{folder.name.tag} - 태그 목록</li>
            <li>{folder.name.prompt} - 프롬프트 저장</li>
            <li>{folder.name.reference} - 참고 자료</li>
            <li>{folder.name.channelHistory} - 채널 히스토리</li>
            <li>{folder.name.result} - 검색결과 저장 폴더</li>
            <li>{folder.name.verbs} - 동사</li>
            <li>{folder.name.patterns} - 문형</li>
            <li>{folder.name.concepts} - 문법 개념</li>
            <li>{folder.name.expressions} - 예문</li>
            <li>{folder.name.progress} - progress(준비중)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
