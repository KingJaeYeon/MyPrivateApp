import { cn } from '@/lib/utils';

export function IconEyeOn({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, 'text-icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M1 8.81818C1 8.81818 3.90909 3 9 3C14.0909 3 17 8.81818 17 8.81818C17 8.81818 14.0909 14.6364 9 14.6364C3.90909 14.6364 1 8.81818 1 8.81818Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11C10.205 11 11.1818 10.0232 11.1818 8.81818C11.1818 7.6132 10.205 6.63636 9 6.63636C7.79502 6.63636 6.81818 7.6132 6.81818 8.81818C6.81818 10.0232 7.79502 11 9 11Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, 'text-icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <g clipPath="url(#clip0_10214_56121)">
        <path
          d="M13.32 13.32C12.0768 14.2676 10.563 14.7926 9 14.8182C3.90909 14.8182 1 9 1 9C1.90465 7.31411 3.15937 5.84117 4.68 4.68M7.47273 3.35636C7.97333 3.23918 8.48586 3.18061 9 3.18182C14.0909 3.18182 17 9 17 9C16.5585 9.8259 16.032 10.6034 15.4291 11.32M10.5418 10.5418C10.3421 10.7562 10.1012 10.9281 9.83357 11.0474C9.56593 11.1666 9.27702 11.2307 8.98407 11.2359C8.69111 11.2411 8.40012 11.1872 8.12844 11.0774C7.85677 10.9677 7.60998 10.8044 7.4028 10.5972C7.19562 10.39 7.03229 10.1432 6.92255 9.87156C6.81282 9.59988 6.75893 9.30889 6.7641 9.01593C6.76927 8.72298 6.83339 8.43407 6.95264 8.16643C7.07189 7.8988 7.24382 7.65793 7.45818 7.45818M1 1L17 17"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_10214_56121">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
