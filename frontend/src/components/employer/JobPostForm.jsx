import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { jobPostSchema } from '@/utils/validators'

const JOB_TYPES      = [['fulltime','Full-time'],['parttime','Part-time'],['contract','Kontrak'],['freelance','Freelance'],['internship','Magang'],['remote','Remote']]
const EXPERIENCE_OPT = [['fresh','Fresh Graduate'],['1-2','1-2 Tahun'],['3-5','3-5 Tahun'],['5+','5+ Tahun']]
const CATEGORIES     = ['Teknologi','Desain','Marketing','Keuangan','Pendidikan','Kesehatan','Hukum','Logistik','HR','Lainnya']

const JobPostForm = ({ onSubmit, defaultValues = {}, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      type: 'fulltime',
      experience: 'fresh',
      slots: 1,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Input
        label="Judul Posisi"
        placeholder="contoh: Senior React Developer"
        error={errors.title?.message}
        required
        {...register('title')}
      />

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Tipe Pekerjaan <span style={{ color: 'var(--error)' }}>*</span></label>
          <select className={`form-input ${errors.type ? 'form-input--error' : ''}`} {...register('type')}>
            {JOB_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {errors.type && <p className="form-error">{errors.type.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Kategori <span style={{ color: 'var(--error)' }}>*</span></label>
          <select className={`form-input ${errors.category ? 'form-input--error' : ''}`} {...register('category')}>
            <option value="">-- Pilih Kategori --</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Pengalaman <span style={{ color: 'var(--error)' }}>*</span></label>
          <select className="form-input" {...register('experience')}>
            {EXPERIENCE_OPT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <Input
          label="Jumlah Posisi"
          type="number"
          min={1}
          max={500}
          placeholder="1"
          error={errors.slots?.message}
          required
          {...register('slots', { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Lokasi"
        placeholder="contoh: Jakarta Selatan / Remote"
        error={errors.location?.message}
        required
        {...register('location')}
      />

      <div className="grid-2">
        <Input
          label="Gaji Minimum (IDR)"
          type="number"
          placeholder="contoh: 5000000"
          hint="Opsional — kosongkan jika tidak ingin ditampilkan"
          {...register('salaryMin', { valueAsNumber: true })}
        />
        <Input
          label="Gaji Maksimum (IDR)"
          type="number"
          placeholder="contoh: 10000000"
          {...register('salaryMax', { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Batas Lamaran"
        type="date"
        error={errors.deadline?.message}
        required
        {...register('deadline')}
      />

      <div className="form-group">
        <label className="form-label">Deskripsi Pekerjaan <span style={{ color: 'var(--error)' }}>*</span></label>
        <textarea
          className={`form-input ${errors.description ? 'form-input--error' : ''}`}
          rows={7}
          placeholder="Deskripsikan tanggung jawab dan tugas pekerjaan..."
          {...register('description')}
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Persyaratan</label>
        <textarea
          className={`form-input ${errors.requirements ? 'form-input--error' : ''}`}
          rows={5}
          placeholder="Tuliskan kualifikasi, pendidikan, dan skill yang dibutuhkan..."
          {...register('requirements')}
        />
        {errors.requirements && <p className="form-error">{errors.requirements.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Benefit & Fasilitas</label>
        <textarea
          className="form-input"
          rows={4}
          placeholder="Tuliskan benefit yang diberikan perusahaan..."
          {...register('benefits')}
        />
      </div>

      <Button type="submit" variant="accent" size="lg" loading={isLoading}>
        Simpan Lowongan
      </Button>
    </form>
  )
}

export default JobPostForm
