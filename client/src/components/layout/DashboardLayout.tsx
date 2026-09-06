import { Outlet } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-svh bg-background">
        <Sidebar />
        <Header />
        <main className="lg:pl-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
