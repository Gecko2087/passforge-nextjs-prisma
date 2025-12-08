"use client";

import { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const ThemeProvider = ({children}: {children: ReactNode}) => {
    
    return (
     <QueryClientProvider client={queryClient}>
        <Toaster 
        position="bottom-right"
        richColors
        />
      {children}
    </QueryClientProvider>
  )
};
export default ThemeProvider;
