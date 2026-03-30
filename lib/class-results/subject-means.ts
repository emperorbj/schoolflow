import type { BulkReportCardsResponse } from "@/types/class-results";

export type SubjectMeanChartRow = {
  subjectId: string;
  label: string;
  fullName: string;
  meanPercent: number;
  studentCount: number;
};

/**
 * Mean of totalPercent per subject over students who have that subject in report-cards payload.
 */
export function subjectMeansFromBulkReportCards(
  data: BulkReportCardsResponse | undefined,
): SubjectMeanChartRow[] {
  if (!data?.subjectsMeta?.length) return [];

  const rows: SubjectMeanChartRow[] = [];
  for (const meta of data.subjectsMeta) {
    let sum = 0;
    let count = 0;
    for (const student of data.students ?? []) {
      const row = student.subjects.find((s) => s.subjectId === meta.subjectId);
      if (row == null || Number.isNaN(row.totalPercent)) continue;
      sum += row.totalPercent;
      count += 1;
    }
    rows.push({
      subjectId: meta.subjectId,
      label: meta.subjectCode?.trim() || meta.subjectName.slice(0, 10),
      fullName: meta.subjectName,
      meanPercent: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      studentCount: count,
    });
  }
  return rows.filter((r) => r.studentCount > 0);
}
