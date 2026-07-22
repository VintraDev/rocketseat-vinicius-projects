import { Button } from "../ui/button";
import { ReactNode } from "react";

type SocialItem = {
    link: string;
    icon: ReactNode;
}

type SocialItemsProps = {
    social_medias: SocialItem[];
}

export function SocialMedias( { social_medias }: SocialItemsProps ) {
    return (
        <div className="flex flex-row gap-4 p-6 items-center justify-center w-full">
            {social_medias.map((item, index) => (
                <Button variant="secondary" size="icon" key={index}>
                    <a target="_blank" href={item.link}>{item.icon}</a>
                </Button>
            ))}
        </div>
    )
}