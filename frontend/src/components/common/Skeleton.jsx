const Skeleton = ({
  width,
  height,
  variant = '',  // '', 'text', 'title', 'card', 'avatar'
  rounded = false,
  className = '',
  style = {},
}) => (
  <div
    className={`skeleton ${variant ? `skeleton--${variant}` : ''} ${rounded ? 'skeleton--avatar' : ''} ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
)

// Preset skeletons
export const SkeletonJobCard = () => (
  <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Skeleton width={48} height={48} rounded />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton variant="title" width="70%" />
        <Skeleton variant="text" width="50%" />
      </div>
    </div>
    <Skeleton variant="text" width="40%" />
    <div style={{ display: 'flex', gap: 8 }}>
      <Skeleton width={64} height={24} style={{ borderRadius: 99 }} />
      <Skeleton width={80} height={24} style={{ borderRadius: 99 }} />
      <Skeleton width={72} height={24} style={{ borderRadius: 99 }} />
    </div>
  </div>
)

export const SkeletonStatCard = () => (
  <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton variant="title" width={60} height={36} />
      <Skeleton variant="text" width={100} />
    </div>
    <Skeleton width={48} height={48} style={{ borderRadius: 12 }} />
  </div>
)

export default Skeleton
