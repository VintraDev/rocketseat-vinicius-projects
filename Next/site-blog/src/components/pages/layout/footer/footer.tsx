import Link from "next/link";
import { Logo } from "../../../shared/logo";

export function Footer() {
    return (
        <footer className="bg-gray-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-row justify-between gap-8">
                    <Logo />

                    <nav className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
                        <Link href='/termos-de-uso' className="text-blue-100 hover:text-blue-200">
                            Termos de Uso
                        </Link>
                        <Link href='/politica-de-privacidade' className="text-blue-100 hover:text-blue-200">
                            Política de privacidade
                        </Link>
                        <Link href='/feedback' className="text-blue-100 hover:text-blue-200">
                            Feedback
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}