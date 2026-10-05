'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  Bug,
  ChevronDown,
  CloudSun,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/language-provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';

type NavCategoryProps = {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
    requiresAuth?: boolean;
  }[];
  user: any;
  pathname: string;
  unreadCount?: number;
  onNavigate?: () => void;
};

function NavCategory({ title, items, user, pathname, unreadCount = 0, onNavigate }: NavCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const filteredItems = items.filter(item => !item.requiresAuth || user);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-semibold text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden">
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {filteredItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                disabled={item.disabled}
                tooltip={item.label}
              >
                <Link href={item.href} prefetch={true} onClick={onNavigate}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.href === '/messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
      {/* Render icons only when collapsed on desktop */}
      <div className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenu>
          {filteredItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                disabled={item.disabled}
                tooltip={item.label}
              >
                <Link href={item.href} prefetch={true} onClick={onNavigate}>
                  <item.icon />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </Collapsible>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { t } = useLanguage();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const conversationsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: conversations } = useCollection(conversationsQuery);
  
  const unreadCount = useMemo(() => {
    if (!conversations || !user) return 0;
    return conversations.filter(conv => {
      const lastMessageDate = conv.lastMessage?.createdAt?.toDate() || new Date(0);
      const lastReadDate = conv.lastRead?.[user.uid]?.toDate() || new Date(0);
      return lastMessageDate > lastReadDate && conv.lastMessage?.senderId !== user.uid;
    }).length;
  }, [conversations, user?.uid]);

  const mainNav = [{ href: '/dashboard', label: t.dashboard, icon: LayoutDashboard }];
  const aiToolsNav = [
    { href: '/price-prediction', label: t.pricePrediction, icon: TrendingUp },
    { href: '/disease-diagnosis', label: t.diseaseDiagnosis, icon: Bug },
    { href: '/weather-prediction', label: t.weatherPrediction, icon: CloudSun },
  ];
  const platformNav = [
    { href: '/marketplace', label: t.marketplace, icon: ShoppingCart, disabled: false, requiresAuth: true },
    { href: '/community', label: t.community, icon: Users, disabled: false, requiresAuth: true },
    { href: '/messages', label: t.messages, icon: MessageSquare, disabled: false, requiresAuth: true },
  ];
  const userNav = [
    { href: '/profile', label: t.profile, icon: User, disabled: false, requiresAuth: true },
    { href: '/settings', label: t.settings, icon: Settings, disabled: false, requiresAuth: true },
  ];

  const handleLogout = async () => {
    handleNavigate();
    if (auth) {
      await signOut(auth);
      window.location.href = '/';
    }
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <span className="font-headline text-xl font-bold group-data-[collapsible=icon]:hidden bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Farmingo</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 space-y-2">
        <SidebarMenu>
          {mainNav.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                disabled={item.disabled}
                tooltip={item.label}
              >
                <Link href={item.href} prefetch={true} onClick={handleNavigate}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <NavCategory title={t.aiTools} items={aiToolsNav} user={user} pathname={pathname} onNavigate={handleNavigate} />
        <NavCategory title={t.platform} items={platformNav} user={user} pathname={pathname} unreadCount={unreadCount} onNavigate={handleNavigate} />
        <NavCategory title={t.account} items={userNav} user={user} pathname={pathname} onNavigate={handleNavigate} />

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t.logout}>
                <LogOut />
                <span>{t.logout}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip={t.login}>
                  <Link href="/login" prefetch={true} onClick={handleNavigate}>
                    <LogIn />
                    <span>{t.login}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/signup'} tooltip={t.signup}>
                  <Link href="/signup" prefetch={true} onClick={handleNavigate}>
                    <UserPlus />
                    <span>{t.signup}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
