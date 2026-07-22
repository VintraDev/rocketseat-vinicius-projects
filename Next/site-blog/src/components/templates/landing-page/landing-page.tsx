import { CustomerStoriesSection, FeatureSection, HeroSection, SupportSection } from "@/components/templates/landing-page/sections/Home";


export function LandingPage() {
    return (
        <>
            <article className="flex flex-col gap-10 md:gap-20">
                <HeroSection />
                <FeatureSection />
                <SupportSection />
                <CustomerStoriesSection />
            </article>
        </>
    );
}