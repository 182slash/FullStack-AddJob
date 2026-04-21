import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',   // primary | secondary | accent | ghost | danger
      size    = 'md',        // sm | md | lg
      loading = false,
      disabled = false,
      icon,
      iconRight,
      block = false,
      className = '',
      as: Tag = 'button',
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      `btn--${variant}`,
      size !== 'md' && `btn--${size}`,
      block && 'btn--block',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Tag
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="spin" />
        ) : (
          icon && <span className="btn__icon">{icon}</span>
        )}
        {children}
        {!loading && iconRight && <span className="btn__icon">{iconRight}</span>}
      </Tag>
    )
  }
)

Button.displayName = 'Button'
export default Button
