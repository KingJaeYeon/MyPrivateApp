import { cn } from "@/lib/utils";

export default function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, "text-icon")}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M2 4H3.5M3.5 4H15.5M3.5 4L3.5 14.5C3.5 14.8978 3.65803 15.2794 3.93934 15.5607C4.22064 15.842 4.60217 16 5 16H12.5C12.8978 16 13.2794 15.842 13.5607 15.5607C13.842 15.2794 14 14.8978 14 14.5V4M5.75 4V2.5C5.75 2.10218 5.90804 1.72064 6.18934 1.43934C6.47064 1.15804 6.85218 1 7.25 1H10.25C10.6478 1 11.0294 1.15804 11.3107 1.43934C11.592 1.72064 11.75 2.10218 11.75 2.5V4M7.25 7.75V12.25M10.25 7.75V12.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
