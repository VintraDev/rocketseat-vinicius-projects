import Image from "next/image";

export function Avatar() {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="size-28 rounded-full border-2 border-(--border-color) overflow-hidden">
                <Image
                    className="size-full object-cover"
                    src="/profile-image.jpg"
                    width={125}
                    height={125}
                    quality={100}
                    alt="Imagem de perfil"
                />
            </div>
            <p>@VintraDev</p>
        </div>
    )
}