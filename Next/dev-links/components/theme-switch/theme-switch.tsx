"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Switch } from "../ui/switch"
import { MoonStar, Sun } from "lucide-react"

const subscribe = () => () => {}

export function ThemeSwitch() {
    const { setTheme, resolvedTheme } = useTheme()
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )

    if (!mounted) {
        return (
            <div className="w-full flex justify-center items-center my-4">
                <Switch disabled checked={false} />
            </div>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <div className="w-full flex justify-center items-center my-4">
            <Switch 
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Alternar tema escuro"
            >
                {isDark ? <MoonStar className="size-5 text-slate-800" /> : <Sun className="size-5 text-amber-500" />}
            </Switch>
        </div>
    )
}