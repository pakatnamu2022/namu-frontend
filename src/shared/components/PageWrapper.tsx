import { cn } from "@/lib/utils";

interface Props {
  children?: React.ReactNode;
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className={cn("w-full md:pt-0 space-y-6")}>{children}</div>
  );
}
