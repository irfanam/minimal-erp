import React, { createContext, useContext, useState } from 'react'

export interface WorkflowTransition { action: string; from: string; to: string; label?: string }
export interface WorkflowDefinition { key: string; states: string[]; transitions: WorkflowTransition[] }

interface WorkflowState {
  definitions: Record<string, WorkflowDefinition>
  register(def: WorkflowDefinition): void
  get(key: string): WorkflowDefinition | undefined
}

const WorkflowContext = createContext<WorkflowState | null>(null)

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [definitions, setDefinitions] = useState<Record<string, WorkflowDefinition>>({})
  function register(def: WorkflowDefinition) { setDefinitions(d => ({ ...d, [def.key]: def })) }
  function get(key: string) { return definitions[key] }

  return (
    <WorkflowContext.Provider value={{ definitions, register, get }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('WorkflowProvider missing')
  return ctx
}
