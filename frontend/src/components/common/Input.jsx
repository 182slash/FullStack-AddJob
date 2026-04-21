import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      icon,
      iconRight,
      className = '',
      wrapperClass = '',
      required,
      as: Tag = 'input',
      ...props
    },
    ref
  ) => {
    const inputClass = [
      'form-input',
      error && 'form-input--error',
      (icon || iconRight) && 'form-input--with-icon',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={`form-group ${wrapperClass}`}>
        {label && (
          <label className="form-label">
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
          </label>
        )}

        <div style={{ position: 'relative' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          )}

          <Tag
            ref={ref}
            className={inputClass}
            style={icon ? { paddingLeft: 40 } : iconRight ? { paddingRight: 40 } : {}}
            {...props}
          />

          {iconRight && (
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                display: 'flex',
              }}
            >
              {iconRight}
            </span>
          )}
        </div>

        {error && (
          <p className="form-error">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
        {hint && !error && <p className="form-hint">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
