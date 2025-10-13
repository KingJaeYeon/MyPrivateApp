import { z, ZodError, ZodType } from 'zod';

export function getIssueFieldKeys(issues: z.core.$ZodIssue[]): string[] {
  return issues
    .map((i) => (typeof i.path?.[0] === 'string' ? String(i.path[0]) : ''))
    .filter(Boolean);
}

export function zodParseSafe<T extends ZodType<any, any, any>>(
  zodSchema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; data: string; issues: z.core.$ZodIssue[] } {
  try {
    const res = zodSchema.parse(data);
    return { success: true, data: res };
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
