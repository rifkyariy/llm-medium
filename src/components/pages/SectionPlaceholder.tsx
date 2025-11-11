type SectionPlaceholderProps = {
  title: string;
  description: string;
  actions?: string[];
};

export function SectionPlaceholder({ title, description, actions = [] }: SectionPlaceholderProps) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-10 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      <p className="mt-3 text-sm text-zinc-600">{description}</p>
      {actions.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-500">
          {actions.map((action) => (
            <li key={action} className="rounded-full border border-zinc-200 px-4 py-2">
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
