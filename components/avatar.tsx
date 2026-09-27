import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  size?: number
}

export function Avatar({ src, name, className, size = 36 }: AvatarProps) {
  const initial = (name?.[0] ?? 'U').toUpperCase()
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? 'user'}
        width={size}
        height={size}
        loader={({ src }) => src}
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  // Deterministic pastel background from name to avoid clashing colours.
  const hue = Array.from(name ?? 'U').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0)
  return (
    <span
      aria-hidden={name ? false : true}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium text-white',
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${hue}, 60%, 48%)`,
        fontSize: Math.max(10, size / 2.2),
      }}
      title={name ?? 'user'}
    >
      {initial}
    </span>
  )
}
