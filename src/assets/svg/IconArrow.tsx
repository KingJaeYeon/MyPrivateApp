export function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="6"
      fill="none"
      viewBox="0 0 10 6"
    >
      <path stroke="currentColor" d="M1 1l4 4 4-4" />
    </svg>
  );
}

export function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="6"
      fill="none"
      viewBox="0 0 10 6"
      transform="rotate(180)"
    >
      <path stroke="currentColor" d="M1 1l4 4 4-4" />
    </svg>
  );
}
