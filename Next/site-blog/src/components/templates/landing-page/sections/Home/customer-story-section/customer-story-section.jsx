import Image from "next/image"

const customerStories = [
    {
        content: 'Criar minha loja com o site.set foi a melhor decisão para o meu negócio. A plataforma é super intuitiva, e consegui colocar meus produtos à venda em poucos minutos.',
        author: {
            name: 'Annette Bones',
            role: 'CEO na Anne Corp',
            avatar: '/assets/customer-01.png'
        }
    },
    {
        content: 'Transformar minha ideia em uma loja online foi fácil e rápido. Adorei as opções de personalização e a simplicidade para gerenciar os pedidos. Já vejo meus produtos alcançando mais pessoas!',
        author: {
            name: 'Jacob Jones',
            role: 'CEO na JJ Org',
            avatar: '/assets/customer-02.png'
        }
    }
]

export function CustomerStoriesSection() {
    return (
        <section className="container py-8 md:py-10">
            <div className="flex flex-col items-center gap-12">
                <h2 className="font-sans text-heading-xl text-gray-100">
                    Quem utiliza, aprova!
                </h2>

                <div className="grid gap-8 md:grid-cols-2">
                    {customerStories.map((customerStories) => (
                        <div key={customerStories.author.name} className="flex flex-col gap-6 rounded-lg bg-gray-500 p-6 md:p-12">
                            <p className="text-balance text-gray-200">
                                {customerStories.content}
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                    <Image
                                        src={customerStories.author.avatar}
                                        alt={customerStories.author.name}
                                        fill
                                        sizes="fill"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-gray-200 text-sm">
                                        {customerStories.author.name}
                                    </h3>
                                    <span className="text-xs text-gray-300">
                                        {customerStories.author.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </section>
    )
}