// src/layout/Layout.jsx
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  FileText,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  NotificationToast,
  useNotifications,
} from "@/components/shared/NotificationToast";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Apartments", url: createPageUrl("Apartments"), icon: Building2 },
  { title: "Clients", url: createPageUrl("Clients"), icon: Users },
  { title: "Contracts", url: createPageUrl("Contracts"), icon: FileText },
  {
    title: "Sales & Payments",
    url: createPageUrl("SalesAndPayments"),
    icon: DollarSign,
  },
  { title: "Reports", url: createPageUrl("Reports"), icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  React.useEffect(() => {
    window.addNotification = addNotification;
  }, [addNotification]);

  return (
    <SidebarProvider>
      {/* Global design tokens */}
      <style>{`
        :root {
          --primary-navy: #0f172a;
          --primary-gold: #fbbf24;
          --bg-page: #f9fafb;
        }
      `}</style>

      {/* App shell */}
      <div className="h-screen w-full flex bg-[var(--bg-page)] text-slate-900 overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200 bg-slate-900 text-white">
          <SidebarHeader className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Alrwid</h2>
                <p className="text-xs text-slate-300">
                  Construction &amp; Contracting
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={[
                            "mb-1 rounded-xl transition-all duration-200",
                            "hover:bg-slate-800/70",
                            isActive
                              ? "bg-slate-800 text-white"
                              : "text-slate-200",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <item.icon
                              className={[
                                "w-5 h-5",
                                isActive ? "text-amber-400" : "text-slate-400",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            />
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main content column */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile top bar */}
          <header className="md:hidden flex-shrink-0 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">
                  Alrwid
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable page content */}
          <div className="flex-1 overflow-auto min-h-0">
            {/* Optional: constrain inner width slightly while keeping full-bleed background */}
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Toasts */}
        <NotificationToast
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    </SidebarProvider>
  );
}