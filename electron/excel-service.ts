import {ipcMain} from "electron"
import * as XLSX from "xlsx"

/**
 * Excel 관련 IPC 핸들러 등록
 */
export function setupExcelHandlers() {
    // 새 워크북 + 시트 생성 → 저장
    ipcMain.handle("excel:create", async (_e, filePath: string, data: any[][]) => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        XLSX.writeFile(wb, filePath)
        return true
    })

    // 파일 읽기 (JSON 변환해서 반환)
    ipcMain.handle("excel:read", async (_e, filePath: string) => {
        const wb = XLSX.readFile(filePath)
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
            XLSX.writeFile(wb, filePath)
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
            XLSX.writeFile(wb, filePath)
            return true
        }
    )
}