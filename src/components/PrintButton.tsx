"use client";

import * as React from "react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-black text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
