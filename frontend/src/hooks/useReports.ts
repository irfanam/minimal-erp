import { useMutation, useQuery } from '@tanstack/react-query'
import { listReports, runReport, type ReportRequest, type ReportResult } from '../services/api/reportService'

const KEY = 'reports'

export function useReportsList() {
  return useQuery({ queryKey: [KEY,'list'], queryFn: () => listReports(), staleTime: 5 * 60_000 })
}

export function useReportRun() {
  return useMutation({ mutationFn: (req: ReportRequest) => runReport(req) })
}

export function useLazyReport(req?: ReportRequest) {
  return useQuery<ReportResult>({
    queryKey: [KEY,'run', req],
    queryFn: () => runReport(req!),
    enabled: !!req,
  })
}
