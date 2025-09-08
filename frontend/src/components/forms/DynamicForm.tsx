/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import { FormSection } from './FormSection'
import { FieldGroup } from './FieldGroup'
import { FormActions } from './FormActions'

// Basic field config types
export type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea' | 'custom'

export interface BaseFieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean | ((values: Record<string, unknown>) => boolean)
  readOnly?: boolean | ((values: Record<string, unknown>) => boolean)
  visible?: boolean | ((values: Record<string, unknown>) => boolean)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
  // simple validation pattern message
  pattern?: { value: RegExp, message: string }
  // custom validator returning string | true
  validate?: (value: unknown, values: Record<string, unknown>) => true | string | Promise<true | string>
  // options for select
  options?: { label: string, value: unknown }[] | ((values: Record<string, unknown>) => { label: string, value: unknown }[])
  // custom render (for type custom)
  // use broad type for render to avoid generic incompatibility noise
  render?: (methods: UseFormReturn<any>, field: BaseFieldConfig) => React.ReactNode
  colSpan?: 1 | 2 | 3 | 4
}

export interface SectionConfig {
  id: string
  title: string
  icon?: React.ReactNode
  description?: string
  columns?: 1 | 2 | 3 | 4
  fields: BaseFieldConfig[]
  collapsible?: boolean
}

export interface DynamicFormSchema {
  sections: SectionConfig[]
}

export interface DynamicFormProps<T = any> {
  schema: DynamicFormSchema
  defaultValues?: Partial<T>
  values?: Partial<T> // controlled override
  onChange?: (values: T, meta?: { dirty: boolean }) => void
  onSubmit?: (values: T, mode?: string) => Promise<void> | void
  onDelete?: (values: T) => Promise<void> | void
  autoSave?: boolean
  autoSaveDelay?: number
  loading?: boolean
  submitting?: boolean
  actionsVariant?: 'create' | 'edit'
  className?: string
}

export function DynamicForm<T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  values,
  onChange,
  onSubmit,
  onDelete,
  autoSave = false,
  autoSaveDelay = 800,
  loading,
  submitting,
  actionsVariant = 'create',
  className
}: DynamicFormProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode: 'onBlur'
  })

  const { watch, handleSubmit, reset, formState } = methods
  const allValues = watch()

  // external controlled values
  useEffect(() => {
    if (values) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reset({ ...(defaultValues as any), ...(values as any) }, { keepDirty: true })
    }
  }, [values, reset, defaultValues])

  const evaluate = useCallback((expr: any): any => {
    if (typeof expr === 'function') return expr(allValues)
    return expr
  }, [allValues])

  // autosave debounced
  // simple custom debounce to avoid external dependency
  const debounceRef = useRef<number | undefined>(undefined)
  const debouncedChange = useCallback((vals: T, dirty: boolean) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
  onChange?.(vals, { dirty })
      if (autoSave && dirty && onSubmit) {
        onSubmit(vals, 'autosave')
      }
    }, autoSaveDelay)
  }, [onChange, autoSave, autoSaveDelay, onSubmit])

  useEffect(() => {
    debouncedChange(allValues as T, formState.isDirty)
  }, [allValues, formState.isDirty, debouncedChange])

  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
  }, [])

  const submitHandler = handleSubmit(async data => {
    await onSubmit?.(data, 'submit')
  })

  const saveMode = async (mode?: string) => {
    const data = methods.getValues()
    await onSubmit?.(data, mode)
  }

  // section completion ratio: required fields with value / required count
  const getSectionCompletion = (section: SectionConfig) => {
    const requiredFields = section.fields.filter(f => f.required && evaluate(f.visible) !== false)
    if (requiredFields.length === 0) return 1
    const filled = requiredFields.filter(f => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (allValues as any)[f.name]
      if (v === undefined || v === null) return false
      if (typeof v === 'string' && v.trim() === '') return false
      return true
    })
    return filled.length / requiredFields.length
  }

  // count errors per section
  const getSectionErrors = (section: SectionConfig) => {
    return section.fields.reduce((count, f) => count + (formState.errors[f.name as keyof typeof formState.errors] ? 1 : 0), 0)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={submitHandler} className={className}>
        {schema.sections.map(section => {
          const ratio = getSectionCompletion(section)
          const errors = getSectionErrors(section)
          const visibleFields = section.fields.filter(f => evaluate(f.visible) !== false)
          if (visibleFields.length === 0) return null
          return (
            <FormSection id={section.id} key={section.id} title={section.title} icon={section.icon} completionRatio={ratio} errorCount={errors} collapsible>
              <FieldGroup columns={section.columns || 2}>
                {visibleFields.map(f => {
                  const disabled = evaluate(f.disabled)
                  const readOnly = evaluate(f.readOnly)
                  const options = typeof f.options === 'function' ? f.options(allValues as Record<string, unknown>) : f.options
                  // choose control
                  if (f.type === 'custom' && f.render) {
                    return <div key={f.name} className={`col-span-${f.colSpan || 1}`}>{f.render(methods, f)}</div>
                  }
                  // simple default input mapping (assuming existing primitives elsewhere)
                  return (
                    <div key={f.name} className={`flex flex-col gap-1 col-span-${f.colSpan || 1}`}>
                      <label className="text-xs font-medium text-muted-foreground">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                      {f.type === 'textarea' ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <textarea {...methods.register(f.name as any, {
                          required: f.required ? 'Required' : false,
                          pattern: f.pattern,
                          validate: value => f.validate ? f.validate(value, allValues) : true
                        })} placeholder={f.placeholder} disabled={disabled} readOnly={!!readOnly}
                          className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted/50 disabled:cursor-not-allowed" />
                      ) : f.type === 'select' ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <select {...methods.register(f.name as any, {
                          required: f.required ? 'Required' : false
                        })} disabled={disabled} className="border rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted/50">
                          <option value="">Select...</option>
                          {options?.map(o => {
                            const val = String(o.value as any)
                            return <option key={val} value={val}>{o.label}</option>
                          })}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <input type="checkbox" {...methods.register(f.name as any)} disabled={disabled} className="h-4 w-4" />
                          <span className="text-sm text-foreground/80">{f.placeholder || f.helpText}</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <input type={f.type === 'number' ? 'number' : 'text'}
                          {...methods.register(f.name as any, {
                            required: f.required ? 'Required' : false,
                            pattern: f.pattern,
                            validate: value => f.validate ? f.validate(value, allValues) : true
                          })}
                          placeholder={f.placeholder}
                          disabled={disabled}
                          readOnly={!!readOnly}
                          className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted/50 disabled:cursor-not-allowed" />
                      )}
                      {f.helpText && <p className="text-[10px] text-muted-foreground leading-tight">{f.helpText}</p>}
                      {formState.errors[f.name as keyof typeof formState.errors] && (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <p className="text-[10px] text-red-600">{(formState.errors as any)[f.name]?.message || 'Invalid'}</p>
                      )}
                    </div>
                  )
                })}
              </FieldGroup>
            </FormSection>
          )
        })}
        <FormActions
          variant={actionsVariant}
          loading={loading}
          submitting={submitting}
          isDirty={formState.isDirty}
          canSubmit={formState.isValid}
          onSave={mode => saveMode(mode)}
          onDelete={() => onDelete?.(methods.getValues())}
          onReset={() => reset(defaultValues as any)}
        />
      </form>
    </FormProvider>
  )
}
