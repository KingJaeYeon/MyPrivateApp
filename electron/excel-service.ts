// 로컬파일 읽거나 생성할려면 fs를 통해서 생성하고 읽고 처리해야한다.
import {ipcMain} from "electron"
import * as XLSX from "xlsx"
import fs from "node:fs";
import {format} from "date-fns";
import path from "node:path";

/**
 * Excel 관련 IPC 핸들러 등록
 * // 새 파일 만들기
 * await window.excelApi.create("C:/temp/test.xlsx", [
 *   ["Name", "Age"],
 *   ["Alice", 30],
 *   ["Bob", 25],
 * ])
 *
 * // 읽기
 * const rows = await window.excelApi.read("C:/temp/test.xlsx")
 * console.log(rows)
 *
 * // 덮어쓰기
 * await window.excelApi.overwrite("C:/temp/test.xlsx", [
 *   ["Name", "Age"],
 *   ["Charlie", 22],
 * ])
 *
 * // 행 추가
 * await window.excelApi.append("C:/temp/test.xlsx", [{ Name: "David", Age: 40 }])
 */
export function setupExcelHandlers() {
    // 새 워크북 + 시트 생성 → 저장
    ipcMain.handle("excel:create", async (_e, filePath: string, data: any[][]) => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'buffer'})
        fs.writeFileSync(filePath, wbout)
        return true
    })

    // 파일 읽기 (JSON 변환해서 반환)
    ipcMain.handle("excel:read", async (_e, filePath: string) => {
        const fileBuffer = fs.readFileSync(filePath);
        // XLSX.read 로 워크북 파싱
        const wb = XLSX.read(fileBuffer, {type: "buffer"});
        const sheet = wb.Sheets[wb.SheetNames[0]]
        return XLSX.utils.sheet_to_json(sheet, {defval: ""})
    })

    // 시트 덮어쓰기 (기존 시트 교체)
    ipcMain.handle(
        "excel:overwrite",
        async (_e, filePath: string, data: any[][], sheetName = "Sheet1") => {
            // // 기존 파일 백업용 복사파일 생성
            // const fileBuffer = fs.readFileSync(filePath);
            // // 파일이름: [yyyy-MM-dd]추가해서 저장
            //
            // const wb = XLSX.utils.book_new()
            // const ws = XLSX.utils.aoa_to_sheet(data)
            // XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
            // const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'buffer'})
            // fs.writeFileSync(filePath, wbout)
            // return true
            try {
                const parsed = path.parse(filePath);

                // 0) 상위 폴더 보장
                if (!fs.existsSync(parsed.dir)) {
                    fs.mkdirSync(parsed.dir, { recursive: true });
                }

                let backupPath: string | null = null;

                // 1) 기존 파일이 있으면 → [yyyy-MM-dd] 백업본 생성
                if (fs.existsSync(filePath)) {
                    const stamp = format(new Date(), "yyyy-MM-dd"); // 파일명에 들어갈 날짜
                    // 예: tags[2025-10-03].bak.xlsx
                    backupPath = path.join(parsed.dir, `${parsed.name}[${stamp}].bak${parsed.ext}`);
                    fs.copyFileSync(filePath, backupPath);
                }

                // 2) 새 워크북 생성 + 시트 붙이고 → 버퍼로 작성
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);

                const wbout = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

                // 3) 원자적 저장 (tmp → rename)
                const tmp = path.join(parsed.dir, `${parsed.name}.tmp${parsed.ext}`);
                fs.writeFileSync(tmp, wbout);
                fs.renameSync(tmp, filePath);

                return { ok: true, backupPath };
            } catch (err) {
                console.error("excel:overwrite error", { filePath, err });
                throw err;
            }
        }
    )

    // 시트에 행 추가 (기존 데이터 밑에 append)
    ipcMain.handle(
        "excel:append",
        async (_e, filePath: string, rows: any[], sheetName = "Sheet1") => {
            const wb = XLSX.readFile(filePath)
            const sheet = wb.Sheets[sheetName]
            const json = XLSX.utils.sheet_to_json(sheet, {defval: ""})
            const updated = [...json, ...rows]

            const newSheet = XLSX.utils.json_to_sheet(updated)
            wb.Sheets[sheetName] = newSheet

            const wbout = XLSX.write(wb, {bookType: "xlsx", type: "buffer"})
            fs.writeFileSync(filePath, wbout)
            return true
        }
    )
}