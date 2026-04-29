import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationService } from '@/services/applicationService'

export const appKeys = {
  all:       ['applications'],
  mine:      (params) => [...appKeys.all, 'mine', params],
  detail:    (id) => [...appKeys.all, 'detail', id],
  job:       (jobId) => [...appKeys.all, 'job', jobId],
  stats:     () => [...appKeys.all, 'stats'],
}

export const useAllApplicants = (params = {}) =>
  useQuery({
    queryKey: [...appKeys.all, 'employer-all', params],
    queryFn:  () => applicationService.getAllApplicants(params).then(r => r.data),
  })

export const useMyApplications = (params = {}) =>
  useQuery({
    queryKey: appKeys.mine(params),
    queryFn:  () => applicationService.getMyApplications(params).then(r => r.data),
  })

export const useApplication = (id) =>
  useQuery({
    queryKey: appKeys.detail(id),
    queryFn:  () => applicationService.getApplicationById(id).then(r => r.data),
    enabled:  !!id,
  })

export const useJobApplicants = (jobId, params = {}) =>
  useQuery({
    queryKey: appKeys.job(jobId),
    queryFn:  () => applicationService.getJobApplicants(jobId, params).then(r => r.data),
    enabled:  !!jobId,
  })

export const useApplicationStats = () =>
  useQuery({
    queryKey: appKeys.stats(),
    queryFn:  () => applicationService.getApplicationStats().then(r => r.data),
  })

export const useApplyToJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, formData }) =>
      applicationService.applyToJob(jobId, formData).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all })
    },
  })
}

export const useWithdrawApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => applicationService.withdrawApplication(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all })
    },
  })
}

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }) =>
      applicationService.updateApplicationStatus(id, status, note).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all })
    },
  })
}
