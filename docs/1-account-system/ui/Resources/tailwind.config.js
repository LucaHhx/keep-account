// Keep Account - 统一 Tailwind 配置
// 前端可直接复用此配置
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        income: '#16A34A',
        'income-dark': '#22C55E',
        expense: '#EF4444',
        'expense-dark': '#F87171',
        transfer: '#6B7280',
        'transfer-dark': '#9CA3AF',
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', '"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
}
