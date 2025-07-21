import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui';

// Create a custom render function that includes providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Set up history and push the route
  window.history.pushState({}, 'Test page', route);

  // Create a fresh QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };