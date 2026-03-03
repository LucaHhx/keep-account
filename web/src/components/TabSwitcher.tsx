interface Tab {
  key: string;
  label: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function TabSwitcher({
  tabs,
  activeKey,
  onChange,
}: TabSwitcherProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 lg:dark:bg-gray-700 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${
            activeKey === tab.key
              ? 'bg-white dark:bg-gray-700 lg:dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-50'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
