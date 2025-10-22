import { cn } from '@/lib/utils';

export function IconLinearCopy({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, 'text-icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      strokeWidth="1.5"
    >
      <g clipPath="url(#clip0_10214_56154)">
        <path
          d="M3.4 11.4H2.6C2.17565 11.4 1.76869 11.2314 1.46863 10.9314C1.16857 10.6313 1 10.2243 1 9.8V2.6C1 2.17565 1.16857 1.76869 1.46863 1.46863C1.76869 1.16857 2.17565 1 2.6 1H9.8C10.2243 1 10.6313 1.16857 10.9314 1.46863C11.2314 1.76869 11.4 2.17565 11.4 2.6V3.4M8.2 6.6H15.4C16.2837 6.6 17 7.31634 17 8.2V15.4C17 16.2837 16.2837 17 15.4 17H8.2C7.31634 17 6.6 16.2837 6.6 15.4V8.2C6.6 7.31634 7.31634 6.6 8.2 6.6Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_10214_56154">
          <rect width="18" height="18" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function IconSolidCopy({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, 'text-icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <g clipPath="url(#clip0_10475_163341)">
        <path
          d="M15.4001 6.59998H8.2001C7.31644 6.59998 6.6001 7.31632 6.6001 8.19998V15.4C6.6001 16.2836 7.31644 17 8.2001 17H15.4001C16.2838 17 17.0001 16.2836 17.0001 15.4V8.19998C17.0001 7.31632 16.2838 6.59998 15.4001 6.59998Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.4 11.4H2.6C2.17565 11.4 1.76869 11.2314 1.46863 10.9314C1.16857 10.6313 1 10.2243 1 9.8V2.6C1 2.17565 1.16857 1.76869 1.46863 1.46863C1.76869 1.16857 2.17565 1 2.6 1H9.8C10.2243 1 10.6313 1.16857 10.9314 1.46863C11.2314 1.76869 11.4 2.17565 11.4 2.6V3.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_10475_163341">
          <rect width="18" height="18" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}
