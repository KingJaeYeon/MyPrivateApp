import { ipcMain } from 'electron';
import path from 'node:path';
import fs, { promises as fsp } from 'node:fs';

// 사용 예시
// 폴더 지정 후 엑셀 파일만 목록
// const dir = await window.api.pickFolder()
// if (!dir) return
// await window.fsApi.ensureDir(dir)
// const excelNames = await window.fsApi.listExcel(dir)
//
//  고급 목록(숨김 제외, 디렉터리 포함 X, .xlsx/.xls만, 최신 수정순)
// const items = await window.fsApi.list(dir, {
//     exts: ['.xlsx', '.xls'],
//     includeDirs: false,
//     excludeHidden: true,
//     sortBy: 'mtime',
//     desc: true,
// })

/** baseDir 바깥으로 벗어나는 경로를 차단 (디렉토리 트래버설 방지) */
function resolveInside(baseDir: string, targetPath: string) {
  const full = path.resolve(baseDir, targetPath);
  const base = path.resolve(baseDir);
  if (!(full === base || full.startsWith(base + path.sep))) {
    throw new Error('Path escape blocked');
  }
  return full;
}

export type FsListOptions = {
  /** 확장자 필터 (예: ['.xlsx', '.xls']) */
  exts?: string[];
  /** 숨김파일 제외 (기본 true) */
  excludeHidden?: boolean;
  /** 디렉터리 포함 여부 (기본 false = 파일만) */
  includeDirs?: boolean;
  /** 정렬 기준: name|mtime|size (기본 name) */
  sortBy?: 'name' | 'mtime' | 'size';
  /** 내림차순 여부 (기본 false) */
  desc?: boolean;
};

export function setupFsHandlers() {
  ipcMain.handle('fs:saveImage', async (_e, fileBuffer, targetPath) => {
    try {
      const dir = path.dirname(targetPath);

      // 폴더 없으면 생성
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 파일 저장
      fs.writeFileSync(targetPath, Buffer.from(fileBuffer));

      return { success: true, path: targetPath, message: 'success' };
    } catch (err) {
      console.error('Image save error:', err);
      return { success: false, message: 'failed to write file', path: '' };
    }
  });
  // 존재 여부
  ipcMain.handle('fs:exists', async (_e, p: string) => {
    try {
      await fsp.access(p);
      return true;
    } catch {
      return false;
    }
  });

  // 디렉터리 보장 생성
  ipcMain.handle('fs:ensureDir', async (_e, dir: string) => {
    await fsp.mkdir(dir, { recursive: true });
    return true;
  });

  // 디렉터리 목록 (필터/정렬 지원)
  ipcMain.handle('fs:list', async (_e, dir: string, opts?: FsListOptions) => {
    const {
      exts,
      excludeHidden = true,
      includeDirs = false,
      sortBy = 'name',
      desc = false,
    } = opts ?? {};

    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const rows: Array<{
      name: string;
      fullPath: string;
      isDir: boolean;
      size: number;
      mtimeMs: number;
      ext: string;
    }> = [];

    for (const ent of entries) {
      const name = ent.name;
      if (excludeHidden && name.startsWith('.')) continue;

      const full = path.join(dir, name);
      const isDir = ent.isDirectory();

      // 파일만 보여주되 includeDirs = true면 디렉터리도 포함
      if (isDir && !includeDirs) {
        continue;
      }
      const st = await fsp.stat(full);
      const ext = isDir ? '' : path.extname(name).toLowerCase();

      // 확장자 필터
      if (!isDir && exts && exts.length > 0 && !exts.includes(ext)) {
        continue;
      }

      rows.push({
        name,
        fullPath: full,
        isDir,
        size: st.size,
        mtimeMs: st.mtimeMs,
        ext,
      });
    }

    // 정렬
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'mtime') cmp = a.mtimeMs - b.mtimeMs;
      else if (sortBy === 'size') cmp = a.size - b.size;
      else cmp = a.name.localeCompare(b.name, undefined, { numeric: true });
      return desc ? -cmp : cmp;
    });

    return rows;
  });

  // 엑셀 전용 목록 (편의 핸들러)
  ipcMain.handle('fs:listExcel', async (_e, dir: string) => {
    const rows = await fsp.readdir(dir, { withFileTypes: true });
    return rows
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((n) => {
        const ext = path.extname(n).toLowerCase();
        return ext === '.xlsx' || ext === '.xls';
      });
  });

  // 파일 읽기 (텍스트)
  ipcMain.handle(
    'fs:readText',
    async (_e, filePath: string, encoding: BufferEncoding = 'utf-8') => {
      const data = await fsp.readFile(filePath, { encoding });
      return data;
    }
  );

  // 파일 쓰기 (텍스트) — 상위 폴더 자동 생성
  ipcMain.handle(
    'fs:writeText',
    async (_e, filePath: string, content: string, encoding: BufferEncoding = 'utf-8') => {
      await fsp.mkdir(path.dirname(filePath), { recursive: true });
      await fsp.writeFile(filePath, content, { encoding });
      return true;
    }
  );

  // 파일 읽기 (바이너리: ArrayBuffer 비슷한 Uint8Array 반환)
  ipcMain.handle('fs:readBinary', async (_e, filePath: string) => {
    const buf = await fsp.readFile(filePath);
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  });

  // 파일 쓰기 (바이너리)
  ipcMain.handle('fs:writeBinary', async (_e, filePath: string, data: Uint8Array) => {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, Buffer.from(data));
    return true;
  });

  // 파일/폴더 삭제
  ipcMain.handle(
    'fs:rm',
    async (_e, targetPath: string, opts?: { recursive?: boolean; force?: boolean }) => {
      await fsp.rm(targetPath, {
        recursive: opts?.recursive ?? false,
        force: opts?.force ?? false,
      });
      return true;
    }
  );

  // 이동/이름변경
  ipcMain.handle('fs:rename', async (_e, fromPath: string, toPath: string) => {
    await fsp.mkdir(path.dirname(toPath), { recursive: true });
    await fsp.rename(fromPath, toPath);
    return true;
  });

  // baseDir 안에서만 안전하게 쓰기 (경로 검증 예시)
  ipcMain.handle(
    'fs:safeWriteText',
    async (_e, baseDir: string, relativePath: string, content: string) => {
      const full = resolveInside(baseDir, relativePath);
      await fsp.mkdir(path.dirname(full), { recursive: true });
      await fsp.writeFile(full, content, 'utf-8');
      return full;
    }
  );
}
