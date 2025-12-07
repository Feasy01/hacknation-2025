import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfficerViewProvider } from "@/contexts/OfficerViewContext";
import Index from "./pages/Index";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OfficerViewProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/applications" element={<ApplicationsList />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OfficerViewProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
