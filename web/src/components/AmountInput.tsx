interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  colorClass?: string;
}

export default function AmountInput({
  value,
  onChange,
  label,
  colorClass = 'text-gray-900 dark:text-gray-50',
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty, or valid decimal with up to 2 decimal places
    if (val === '' || /^\d+\.?\d{0,2}$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="px-6 pt-6 md:pt-8 pb-4 md:pb-6 text-center">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </div>
      <div className="flex items-center justify-center">
        <span className="text-2xl md:text-3xl text-gray-400 dark:text-gray-500 mr-1">
          &yen;
        </span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          className={`text-5xl md:text-6xl font-semibold ${colorClass} tracking-tight text-center bg-transparent outline-none w-48 md:w-56 placeholder-gray-300 dark:placeholder-gray-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
      </div>
    </div>
  );
}
