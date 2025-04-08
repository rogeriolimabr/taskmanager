import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Gerenciador de Tarefas</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Organize suas tarefas de forma eficiente com nosso sistema de gerenciamento de tarefas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link href="/register">Registrar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
