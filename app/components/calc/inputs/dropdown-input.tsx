"use client";

type Props = {
  label: string;
  value: string;
  options: string[];
  optionLabels?: string[];
  onChange: (v: string) => void;
};

export function DropdownInput({ label, value, options, optionLabels, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-widest text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {optionLabels ? optionLabels[i] : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
