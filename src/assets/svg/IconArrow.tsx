import { cn } from '@/lib/utils';

export function IconNext({ className }: { className?: string }) {
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
        d="M2 9H16M16 9L9 2M16 9L9 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPrev({ className }: { className?: string }) {
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
        d="M16 9H2M2 9L9 16M2 9L9 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconOutLink({ className }: { className?: string }) {
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
        d="M4 13.8995L13.8995 4M13.8995 4H4M13.8995 4V13.8995"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M14.02 9.44323C13.8 9.66323 13.51 9.77323 13.22 9.77323C12.93 9.77323 12.64 9.66323 12.42 9.44323L9.79 6.81323V14.4032C9.79 15.0232 9.29 15.5332 8.66 15.5332C8.03 15.5332 7.53 15.0332 7.53 14.4032V6.83323L4.92 9.44323C4.48 9.88323 3.77 9.88323 3.33 9.44323C2.89 9.00323 2.89 8.29323 3.33 7.85323L7.87 3.31323C7.87 3.31323 7.96 3.27323 8.01 3.24323C8.12 3.15323 8.24 3.08323 8.38 3.04323C8.44 3.02323 8.49 3.01323 8.55 3.01323C8.89 2.96323 9.24 3.05323 9.5 3.31323L14.03 7.84323C14.47 8.28323 14.47 8.99323 14.03 9.43323L14.02 9.44323Z"
        fill="#4EBE96"
      />
    </svg>
  );
}

export function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.98 8.55677C4.2 8.33677 4.49 8.22677 4.78 8.22677C5.07 8.22677 5.36 8.33677 5.58 8.55677L8.21 11.1868L8.21 3.59677C8.21 2.97677 8.71 2.46677 9.34 2.46677C9.97 2.46677 10.47 2.96677 10.47 3.59677L10.47 11.1668L13.08 8.55677C13.52 8.11677 14.23 8.11677 14.67 8.55677C15.11 8.99677 15.11 9.70677 14.67 10.1468L10.13 14.6868C10.13 14.6868 10.04 14.7268 9.99 14.7568C9.88 14.8468 9.76 14.9168 9.62 14.9568C9.56 14.9768 9.51 14.9868 9.45 14.9868C9.11 15.0368 8.76 14.9468 8.5 14.6868L3.97 10.1568C3.53 9.71677 3.53 9.00677 3.97 8.56677L3.98 8.55677Z"
        fill="#D84F68"
      />
    </svg>
  );
}
