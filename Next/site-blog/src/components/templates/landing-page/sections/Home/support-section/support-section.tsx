import { HeartHandshake, PaintbrushVertical, Store } from "lucide-react";
import { PT_Sans_Caption } from "next/font/google";

const ptSansCaption = PT_Sans_Caption({
    subsets: ['latin'],
    weight: '700'
})

export function SupportSection() {
    return (
        <section className="relative pb-8 md:py-10 bg-gray-500">

            <div className="absolute inset-0 hidden md:block bg-[url('/background-features.svg')] bg-cover bg-center bg-no-repeat opacity-90" />

            <div className="relative container flex flex-col items-center gap-12">
                <h2 className={`${ptSansCaption} text-balance text-center text-heading-xl text-gray-100`}>
                    Sua loja de afiliados, simples, do jeito que deveria ser
                </h2>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Primeiro Card */}
                    <div className="flex flex-col text-left gap-2 rounded-lg p-6 md:p-12 bg-blue-400">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-300">
                            <PaintbrushVertical className="h-8 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-heading-sm gray-100">
                            Personalize seu site
                        </h3>
                        <p className="text-body-sm text-gray-200">
                            Adicione sua logo, favicon, cores no seu catalago e tenha tudo com a sua cara.
                        </p>
                    </div>
                    {/* Segundo Card */}
                    <div className="flex flex-col text-left gap-2 rounded-lg p-6 md:p-12 bg-cyan-300">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-200">
                            <Store className="h-8 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-heading-sm gray-100">
                            Venda de qualquer loja
                        </h3>
                        <p className="text-body-sm text-gray-200">
                            Não importa a loja, o Site.Set permite que você insera qualquer link de afiliado.
                        </p>
                    </div>
                    {/* Terceiro Card */}
                    <div className="flex flex-col text-left gap-2 rounded-lg p-6 md:p-12 bg-blue-400">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-300">
                            <HeartHandshake className="h-8 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-heading-sm gray-100">
                            Receba suporte amigável
                        </h3>
                        <p className="text-body-sm text-gray-200">
                            Nossa equipe estará sempre pronta para te atender para ajudar no que for preciso.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}