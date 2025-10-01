import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {z, ZodError, ZodType} from "zod";
import {ExcelColumn, ExcelConfig, SheetConfig} from "@/store/setting.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const chunk = <T>(arr: T[], size: number) =>
    Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
        arr.slice(i * size, i * size + size)
    );


export function zodParseSafe<T extends ZodType<any, any, any>>(
    zodSchema: T,
    data: unknown
):
    | { success: true; data: z.output<T> }
    | { success: false; data: string; issues: z.core.$ZodIssue[] } {
    try {
        const res = zodSchema.parse(data);
        return {success: true, data: res};
    } catch (e) {
        if (e instanceof ZodError) {
            const first = e.issues[0];
            return {
                success: false,
                data: first?.message ?? '입력값이 올바르지 않습니다.',
                issues: e.issues,
            };
        }
        return {
            success: false,
            data: (e as Error)?.message ?? '알 수 없는 오류',
            issues: [],
        };
    }
}


/**
 * order 순서에 맞춰 essential + optional 컬럼을 정렬한 배열 반환
 * @param excel 전체 ExcelConfig
 * @param key   시트 key (예: "tag")
 * @param mode  "label" | "column" | "full" (full은 ExcelColumn[])
 */
// 오버로드 선언부
function getOrderedColumns(
    excel: ExcelConfig,
    key: keyof ExcelConfig,
    mode: "label"
): string[]
function getOrderedColumns(
    excel: ExcelConfig,
    key: keyof ExcelConfig,
    mode: "column"
): string[]
function getOrderedColumns(
    excel: ExcelConfig,
    key: keyof ExcelConfig,
    mode: "full"
): ExcelColumn[]

// 실제 구현
function getOrderedColumns(
    excel: ExcelConfig,
    key: keyof ExcelConfig,
    mode: "label" | "column" | "full" = "label"
): string[] | ExcelColumn[] {
    const sheet = excel[key]
    if (!sheet) return []

    // essential + optional 합치기
    const allDefs = [...sheet.essentialDefs, ...sheet.optional]
    // id -> ExcelColumn 매핑
    const idToDef = new Map(allDefs.map(def => [def.id, def]))
    console.log(sheet.order)
    // order 기준 정렬
    const orderedDefs = sheet.order
        .map(id => idToDef.get(id))
        .filter((def): def is ExcelColumn => !!def)

    if (mode === "label") return orderedDefs.map(d => d.label)
    if (mode === "column") return orderedDefs.map(d => d.column)
    return orderedDefs
}

function buildAoaFromObjects(
    rows: Record<string, any>[],          // 앱 내부 column기반 데이터 배열
    sheet: SheetConfig                     // 해당 시트 설정
): any[][] {
    // id → def
    const defsMap = new Map(
        [...sheet.essentialDefs, ...sheet.optional].map(d => [d.id, d])
    );
    // order 순서대로 defs
    const orderedDefs = sheet.order
        .map(id => defsMap.get(id))
        .filter((d): d is ExcelColumn => !!d);

    // 헤더(label)
    const header = orderedDefs.map(d => d.label);

    // 바디(column 키로 값 추출)
    const body = rows.map(obj => orderedDefs.map(d => obj[d.column]));

    return [header, ...body];
}

export {getOrderedColumns,buildAoaFromObjects}