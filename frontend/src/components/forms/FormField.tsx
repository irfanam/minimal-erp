import React, { createContext, useContext, useId } from 'react'
import clsx from 'clsx'

interface FormFieldContextValue {
  inputId: string
  descriptionId?: string
  errorId?: string
}
const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export const useFormField = () => {
  return useContext(FormFieldContext)
}

export interface FormFieldProps {
  label?: string
  required?: boolean
  helpText?: string
  error?: string
  id?: string
  className?: string
  children: React.ReactNode
  inline?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  helpText,
  error,
  id,
  className,
  inline = false,
  children,
}) => {
  const autoId = useId()
  const inputId = id || `ff-${autoId}`
  const descriptionId = helpText ? `${inputId}-desc` : undefined
  const errorId = error ? `${inputId}-err` : undefined

  return (
    <FormFieldContext.Provider value={{ inputId, descriptionId, errorId }}>
      <div className={clsx('w-full', inline && 'sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-1 sm:mb-0',
              inline && 'sm:pt-2',
              error ? 'text-danger-600' : 'text-neutral-700'
            )}
          >
            {label}
            {required && <span className="text-danger-600 ml-0.5">*</span>}
          </label>
        )}
        <div className={clsx(inline && 'sm:col-span-2')}> 
          {children}
          {helpText && !error && (
            <p id={descriptionId} className="mt-1 text-xs text-neutral-500">{helpText}</p>
          )}
          {error && (
            <p id={errorId} className="mt-1 text-xs text-danger-600">{error}</p>
          )}
        </div>
      </div>
    </FormFieldContext.Provider>
  )
}
