"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Fade + leve subida a cada troca de rota. Keyed pelo pathname pra reanimar
// na navegação. Curto pra não atrasar a sensação de resposta.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
