import {
  Coffee,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Smartphone,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Gift,
  DollarSign,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export const categoryIconMap: Record<string, LucideIcon> = {
  food: Coffee,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Gamepad2,
  housing: Home,
  communication: Smartphone,
  medical: Heart,
  education: GraduationCap,
  other: MoreHorizontal,
  salary: Briefcase,
  bonus: Gift,
  parttime: DollarSign,
  investment: TrendingUp,
};

export const allIcons: { key: string; icon: LucideIcon; label: string }[] = [
  { key: 'food', icon: Coffee, label: '餐饮' },
  { key: 'transport', icon: Car, label: '交通' },
  { key: 'shopping', icon: ShoppingBag, label: '购物' },
  { key: 'entertainment', icon: Gamepad2, label: '娱乐' },
  { key: 'housing', icon: Home, label: '住房' },
  { key: 'communication', icon: Smartphone, label: '通讯' },
  { key: 'medical', icon: Heart, label: '医疗' },
  { key: 'education', icon: GraduationCap, label: '教育' },
  { key: 'other', icon: MoreHorizontal, label: '其他' },
  { key: 'salary', icon: Briefcase, label: '工资' },
  { key: 'bonus', icon: Gift, label: '奖金' },
  { key: 'parttime', icon: DollarSign, label: '兼职' },
  { key: 'investment', icon: TrendingUp, label: '理财' },
];

export function getCategoryIcon(iconKey: string): LucideIcon {
  return categoryIconMap[iconKey] || MoreHorizontal;
}
