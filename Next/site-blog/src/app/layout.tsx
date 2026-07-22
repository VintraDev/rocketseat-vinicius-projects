import { Layout } from "@/components/pages/layout"
import "@/styles/globals.css"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Site.Set',
    description: 'Venda seus produtos como afiliado em um único lugar',
    robots: 'index, follow',
    openGraph: {
        title: 'Site.Set',
        description: 'Venda seus produtos como afiliado em um único lugar',
        url: 'url-da-imagem-em-producao/og-image.png',
        siteName: 'Site.Set',
        locale: 'pt_BR',
        type: 'website',
        images: [
            {
                url: 'url-da-imagem-em-producao/og-image.png',
                width: 800,
                height: 600,
                alt: 'Site.Set'
            }
        ]
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    )
}