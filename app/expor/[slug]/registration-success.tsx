"use client";

import { motion, useReducedMotion } from "framer-motion";

// Tela de confirmação que o expositor vê após enviar o cadastro. Checkmark
// que se desenha pra dar o "recebido" com clareza, sem ser infantil.
export function RegistrationSuccess({ eventName }: { eventName: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 text-emerald-600"
          aria-hidden="true"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-2xl font-semibold tracking-tight text-slate-900"
      >
        Cadastro enviado
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-2 text-sm text-slate-500"
      >
        Recebemos o seu cadastro para o evento{" "}
        <span className="font-medium text-slate-700">{eventName}</span>. Em breve
        a organização entra em contato.
      </motion.p>
    </div>
  );
}
