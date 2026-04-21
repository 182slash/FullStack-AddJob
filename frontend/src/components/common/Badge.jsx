const Badge = ({ children, variant = 'primary', icon, className = '', ...props }) => (
  <span className={`badge badge--${variant} ${className}`} {...props}>
    {icon && icon}
    {children}
  </span>
)

export default Badge
