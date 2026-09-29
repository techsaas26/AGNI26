interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-4 pt-12 pb-8 text-center">
      <h1 className="font-display text-5xl tracking-wide text-mustard sm:text-6xl">{title}</h1>
      {subtitle && <p className="mt-2 text-paper/70">{subtitle}</p>}
    </header>
  );
}
