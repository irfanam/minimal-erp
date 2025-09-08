import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ArrowRightOnRectangleIcon, Cog6ToothIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../auth/AuthContext'
import clsx from 'clsx'

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth()
  if (!user) return null
  const initials = user.name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">{initials}</span>
        )}
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs font-medium text-neutral-800">{user.name}</span>
          <span className="text-[10px] text-neutral-500">{user.role}</span>
        </span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none divide-y divide-neutral-100">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-neutral-700">{user.name}</p>
            <p className="text-[10px] text-neutral-500">{user.email}</p>
            {user.company && <p className="text-[10px] text-neutral-500 mt-1">{user.company}</p>}
          </div>
          <div className="py-1">
            <MenuItem icon={<UserCircleIcon className="h-4 w-4" />}>Profile Settings</MenuItem>
            <MenuItem icon={<KeyIcon className="h-4 w-4" />}>Change Password</MenuItem>
            <MenuItem icon={<Cog6ToothIcon className="h-4 w-4" />}>Preferences</MenuItem>
          </div>
          <div className="py-1">
            <MenuItem icon={<ArrowRightOnRectangleIcon className="h-4 w-4" />} onClick={logout} className="text-danger-600 hover:text-danger-700">Logout</MenuItem>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

const MenuItem: React.FC<React.PropsWithChildren<{icon?: React.ReactNode; onClick?: () => void; className?: string}>> = ({ icon, children, onClick, className }) => (
  <Menu.Item>
    {({ active }) => (
      <button
        type="button"
        onClick={onClick}
        className={clsx('w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-neutral-700', active && 'bg-neutral-50', className)}
      >
        {icon && <span className="text-neutral-500">{icon}</span>}
        <span className="flex-1">{children}</span>
      </button>
    )}
  </Menu.Item>
)
