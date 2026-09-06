import { SidebarContent } from "./SidebarContent";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-svh w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarContent />
    </aside>
  );
}
