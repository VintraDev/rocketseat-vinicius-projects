import { createClient } from "@/prismicio";
import Image from "next/image";

export async function Avatar() {
    const client = createClient();
    const page = await client.getSingle("home");

    const avatarUrl = page.data.avatar1[0].avatar.url
    const profileName = page.data.avatar1[0].profilename[0].text

    return (
        <div className="flex flex-col items-center gap-2 w-full p-6">
            <div className="size-28 rounded-full border-2 border-(--border-color) overflow-hidden">
                <Image
                    className="size-full object-cover"
                    src={avatarUrl}
                    width={125}
                    height={125}
                    loading="eager"
                    alt="Imagem de perfil"
                />
            </div>
            <p className="text-md">{profileName}</p>
        </div>
    )
}