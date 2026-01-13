interface Props {
  children?: React.ReactNode;
}

export default function HeaderTableWrapper({ children }: Props) {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
      {children}
    </div>
  );
}
