import { Button } from "../ui/button";

type LinkItem = {
    link: string;
    text: string;
}

type LinkListProps = {
    links: LinkItem[];
}

export function LinkList({ links }: LinkListProps) {
    return (
        <div className="flex flex-col gap-4 py-6">
            {links.map((item, index) => (
                <Button key={index}>
                    <a target="_blank" className="text-md" href={item.link}>{item.text}</a>
                </Button>
            ))}
        </div>
    )
}