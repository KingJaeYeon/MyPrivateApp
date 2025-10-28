import { LocationSetting } from '@/pages/settings/LocationFile/components/LocationSetting.tsx';
import { FileGenerator } from '@/pages/settings/LocationFile/components/FileGenerator.tsx';

export function FilesSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* 폴더 선택 */}
      <LocationSetting />
      {/* Excel 파일 생성 */}
      <FileGenerator />
    </div>
  );
}
