"use client"

import { useTheme } from "next-themes";
import Image from "next/image";

export function BackgroundImage() {
    const { resolvedTheme } = useTheme();

    const isDark = resolvedTheme === 'dark';


    return (
        <>
            <Image
                src={isDark ? '/backgrounds/bg-desktop.jpg' : '/backgrounds/bg-desktop-light.jpg'}
                width={1440}
                height={1024}
                alt=""
                className="inset-0 absolute h-full w-full hidden md:block object-cover -z-10"
            />

            <Image
                src={isDark ? '/backgrounds/bg-mobile.jpg' : '/backgrounds/bg-mobile-light.jpg'}
                width={360}
                height={800}
                alt=""
                className="inset-0 absolute h-full w-full md:hidden object-cover -z-10"
            />
        </>
    )
}