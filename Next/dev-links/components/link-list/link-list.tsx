import Link from "next/link";
import { Button } from "../ui/button";

type LinksProps = {
    link: string;
    text: string;
}

export function LinkList(links: LinksProps) {
    return (
        <div>
            {links.map((index) => {
                <Button key={}>
                    <Link href={}></Link>
                </Button>
            })}
        </div>
    )
}