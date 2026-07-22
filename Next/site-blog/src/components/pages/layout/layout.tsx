import { Header } from "./header";
import { Footer } from "./footer";
import { Inter, PT_Sans_Caption } from "next/font/google"
import { CallToAction } from "@/components/templates/landing-page/sections/Home";

type LayoutProps = {
    children: React.ReactNode;
}

const ptSansCaption = PT_Sans_Caption({
    subsets: ['latin'],
    weight: '700',
    variable: '--font-sans'
})

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-inter'
})

export function Layout({ children }: LayoutProps) {
    return (
        <div className={`relative flex min-h-screen flex-col dark ${inter.className} ${ptSansCaption.className} font-inter`}>
            <Header />
            <main className="flex-1 flex flex-col mt-10">
                {children}
            </main>
            <CallToAction />
            <Footer />
        </div>
    )
}