import { apiClient } from './apiClient'

export interface ReportRequest { key: string; params?: Record<string, any> }
export interface ReportResult { key: string; generatedAt: string; rows: any[]; meta?: any }

export async function runReport(req: ReportRequest) {
  const { data } = await apiClient.post<ReportResult>('/reports/run', req)
  return data
}

export async function listReports() {
  const { data } = await apiClient.get<{ key: string; name: string; description?: string }[]>('/reports')
  return data
}
