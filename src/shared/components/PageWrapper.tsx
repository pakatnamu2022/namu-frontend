interface Props {
  children?: React.ReactNode;
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className="max-w-(--breakpoint-2xl) w-full mx-auto md:p-4 md:pt-0 space-y-6">
      {children}
    </div>
  );
}
