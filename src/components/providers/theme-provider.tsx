"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // En React 19 / Next 16, simplemente pasamos el suppressHydrationWarning 
  // y dejamos que next-themes maneje el script. El error de "script tag" 
  // suele venir de anidamientos incorrectos o etiquetas <style> manuales.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
