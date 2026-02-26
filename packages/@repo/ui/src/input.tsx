import { cn } from "@repo/lib";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 border rounded-md text-[#0F172A] placeholder:text-[#94A3B8]",
          "focus:outline-none focus:ring-2 focus:ring-[#DC842C] focus:border-transparent",
          error ? "border-red-500" : "border-[#E2E8F0]",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
