import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-text mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutral-text-secondary">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
