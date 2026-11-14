import { cn } from "@/lib/utils";

const DEFAULT_SWATCH = "#3A3A3F";

interface Props {
  color?: string;
  className?: string;
}

const Swatch = ({ color, className }: Props) => (
  <span
    aria-hidden="true"
    className={cn(
      "block shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_8px_rgba(0,0,0,0.6)]",
      className
    )}
    style={{
      background: `linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.25) 100%), ${color ?? DEFAULT_SWATCH}`,
    }}
  />
);

export default Swatch;
