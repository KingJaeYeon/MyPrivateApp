import {ipcMain} from "electron"
import * as XLSX from "xlsx"
import fs from "node:fs";

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
        console.log('filePath::', filePath, 'data::', data)
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
        const wb = XLSX.read(fileBuffer, { type: "buffer" });
        const sheet = wb.Sheets[wb.SheetNames[0]]
        return XLSX.utils.sheet_to_json(sheet, {defval: ""})
    })

    // 시트 덮어쓰기 (기존 시트 교체)
    ipcMain.handle(
        "excel:overwrite",
        async (_e, filePath: string, data: any[][], sheetName = "Sheet1") => {
            const wb = XLSX.readFile(filePath)
            const newSheet = XLSX.utils.aoa_to_sheet(data)
            wb.Sheets[sheetName] = newSheet

            const wbout = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
            fs.writeFileSync(filePath, wbout)
            return true
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

            const wbout = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
            fs.writeFileSync(filePath, wbout)
            return true
        }
    )
}