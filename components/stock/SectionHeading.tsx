import Link from "next/link";

interface Props {
  children: string;
  action?: { href: string; label: string };
}

const SectionHeading = ({ children, action }: Props) => (
  <div className="flex items-baseline justify-between px-6 pb-3.5 pt-10">
    <h2 className="font-wide text-base font-black uppercase">{children}</h2>
    {action && (
      <Link href={action.href} className="text-[13px] font-bold text-gold">
        {action.label}
      </Link>
    )}
  </div>
);

export default SectionHeading;
