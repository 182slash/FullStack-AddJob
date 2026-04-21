import { getInitials } from '@/utils/formatters'

const Avatar = ({ src, name = '', size = 'md', className = '', ...props }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar avatar--${size} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div className={`avatar avatar--${size} ${className}`} aria-label={name} {...props}>
      {getInitials(name) || '?'}
    </div>
  )
}

export default Avatar
