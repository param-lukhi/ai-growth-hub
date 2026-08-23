import React from 'react';
import Link from 'next/link';
import {
  Smartphone, Laptop, Tv, Headphones, Watch, Gamepad2,
  Home, Utensils, Wind, Box, Disc, Sparkles, Shirt,
  Car, BookOpen, Zap, Layers, ChevronRight
} from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  };
}

const iconMap: Record<string, { icon: any; gradient: string; color: string }> = {
  'mobiles': { icon: Smartphone, gradient: 'from-blue-500 to-indigo-600', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  'laptops': { icon: Laptop, gradient: 'from-sky-500 to-blue-600', color: 'bg-sky-50 text-sky-600 border-sky-200' },
  'tvs': { icon: Tv, gradient: 'from-purple-500 to-indigo-600', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  'earbuds': { icon: Headphones, gradient: 'from-pink-500 to-rose-600', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  'smart-watches': { icon: Watch, gradient: 'from-emerald-500 to-teal-600', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  'accessories': { icon: Layers, gradient: 'from-amber-500 to-orange-600', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  'gaming': { icon: Gamepad2, gradient: 'from-violet-600 to-purple-800', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  'home-kitchen': { icon: Home, gradient: 'from-teal-500 to-emerald-600', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  'kitchen-appliances': { icon: Utensils, gradient: 'from-orange-500 to-amber-600', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  'air-conditioners': { icon: Wind, gradient: 'from-cyan-500 to-blue-600', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  'refrigerators': { icon: Box, gradient: 'from-blue-600 to-cyan-700', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'washing-machines': { icon: Disc, gradient: 'from-indigo-500 to-purple-600', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  'beauty': { icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-600', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
  'fashion': { icon: Shirt, gradient: 'from-rose-500 to-red-600', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  'car-accessories': { icon: Car, gradient: 'from-slate-700 to-neutral-900', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  'books': { icon: BookOpen, gradient: 'from-yellow-600 to-amber-700', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  'amazon-deals': { icon: Zap, gradient: 'from-amber-500 to-orange-500', color: 'bg-amber-100 text-amber-900 border-amber-300' },
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const config = iconMap[category.slug] || {
    icon: Layers,
    gradient: 'from-brand-500 to-brand-700',
    color: 'bg-brand-50 text-brand-600 border-brand-200',
  };

  const IconComponent = config.icon;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative bg-white dark:bg-neutral-900 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-800 hover:border-brand-300 dark:hover:border-brand-600/50 rounded-2xl p-4 shadow-soft hover:shadow-soft-xl transition-all duration-300 flex items-center justify-between overflow-hidden"
    >
      <div className="flex items-center gap-3.5">
        {/* Visual Icon Badge with Smooth Gradient & Shadow */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
          <IconComponent className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
            {category.name}
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            Explore Buying Guides
          </span>
        </div>
      </div>

      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 text-neutral-400 dark:text-neutral-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2">
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </div>
    </Link>
  );
}
