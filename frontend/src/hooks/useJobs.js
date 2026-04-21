import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { jobService } from '@/services/jobService'

// ─── Query Keys ───────────────────────────────────────────
export const jobKeys = {
  all:         ['jobs'],
  lists:       () => [...jobKeys.all, 'list'],
  list:        (filters) => [...jobKeys.lists(), filters],
  details:     () => [...jobKeys.all, 'detail'],
  detail:      (id) => [...jobKeys.details(), id],
  featured:    () => [...jobKeys.all, 'featured'],
  recommended: () => [...jobKeys.all, 'recommended'],
  saved:       () => [...jobKeys.all, 'saved'],
  categories:  () => [...jobKeys.all, 'categories'],
  employer:    () => [...jobKeys.all, 'employer'],
  stats:       () => [...jobKeys.employer(), 'stats'],
}

// ─── Hooks ────────────────────────────────────────────────
export const useJobs = (params = {}) =>
  useQuery({
    queryKey: jobKeys.list(params),
    queryFn:  () => jobService.getJobs(params).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

export const useJob = (id) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn:  () => jobService.getJobById(id).then(r => r.data.data),
    enabled:  !!id,
  })

export const useFeaturedJobs = () =>
  useQuery({
    queryKey: jobKeys.featured(),
    queryFn:  () => jobService.getFeaturedJobs().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

export const useRecommendedJobs = () =>
  useQuery({
    queryKey: jobKeys.recommended(),
    queryFn:  () => jobService.getRecommendedJobs().then(r => r.data),
  })

export const useSavedJobs = () =>
  useQuery({
    queryKey: jobKeys.saved(),
    queryFn:  () => jobService.getSavedJobs().then(r => r.data),
  })

export const useCategories = () =>
  useQuery({
    queryKey: jobKeys.categories(),
    queryFn:  () => jobService.getCategories().then(r => r.data),
    staleTime: 1000 * 60 * 30,
  })

export const useSkills = () =>
  useQuery({
    queryKey: [...jobKeys.all, 'skills'],
    queryFn:  () => jobService.getSkills().then(r => r.data.data),
    staleTime: 1000 * 60 * 10,
  })

export const useEmployerJobs = (params = {}) =>
  useQuery({
    queryKey: [...jobKeys.employer(), params],
    queryFn:  () => jobService.getEmployerJobs(params).then(r => r.data),
  })

export const useJobStats = () =>
  useQuery({
    queryKey: jobKeys.stats(),
    queryFn:  () => jobService.getJobStats().then(r => r.data),
  })

export const useCreateJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => jobService.createJob(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.employer() })
    },
  })
}

export const useUpdateJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => jobService.updateJob(id, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) })
      qc.invalidateQueries({ queryKey: jobKeys.employer() })
    },
  })
}

export const useDeleteJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => jobService.deleteJob(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.employer() })
    },
  })
}

export const useSaveJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, saved }) =>
      saved
        ? jobService.unsaveJob(jobId).then(r => r.data)
        : jobService.saveJob(jobId).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.saved() })
    },
  })
}