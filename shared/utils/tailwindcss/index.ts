import { clsx } from 'clsx'
import className from 'classnames'

export function cn(...classes: Parameters<typeof className>) {
  return className(clsx(...classes))
}
