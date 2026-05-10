import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export function HykoHubLogo({ size = 32, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="HykoHub"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
