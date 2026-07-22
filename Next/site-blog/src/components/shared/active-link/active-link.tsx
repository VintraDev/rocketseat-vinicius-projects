'use client';
import { cn } from "@/lib/utils";
import Link, {LinkProps} from "next/link";
import { usePathname } from "next/navigation";

type ActiveLinkProps = {
    children: React.ReactNode;
} & LinkProps

export function ActiveLink({ children, href, ...rest }: ActiveLinkProps) {
    const linkPath = (typeof href === 'string' ? href: href.pathname) ?? '';
    const pathname = usePathname();
    const isActive = pathname === linkPath || pathname?.startsWith(`${linkPath}/`);

    return (
        <Link
        {...rest} 
        className={cn('text-action-sm font-medium transition-colors hover:text-blue-200', isActive ? 'text-blue-200' : 'text-gray-100')} href={href}>{children}</Link>
    )
}