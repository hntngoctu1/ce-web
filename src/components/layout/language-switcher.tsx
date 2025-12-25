'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

interface LanguageSwitcherProps {
  currentLocale?: string;
  className?: string;
}

export function LanguageSwitcher({ currentLocale = 'vi', className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: string) => {
    // Set locale cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

    // Remove current locale prefix if exists and add new one
    let newPath = pathname;

    // Remove existing locale prefix
    for (const lang of languages) {
      if (pathname.startsWith(`/${lang.code}/`)) {
        newPath = pathname.substring(lang.code.length + 1);
        break;
      } else if (pathname === `/${lang.code}`) {
        newPath = '/';
        break;
      }
    }

    // Add new locale prefix (except for default vi)
    if (locale !== 'vi') newPath = `/${locale}${newPath === '/' ? '' : newPath}`;

    router.push(newPath);
    router.refresh();
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn('cursor-pointer gap-2', currentLocale === lang.code && 'bg-accent')}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
