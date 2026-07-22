import Image from "next/image";

export function Avatar() {
    return (
        <div className="flex flex-col items-center gap-2 w-full p-6">
            <div className="size-28 rounded-full border-2 border-(--border-color) overflow-hidden">
                <Image
                    className="size-full object-cover"
                    src="/profile-image.jpg"
                    width={125}
                    height={125}
                    loading="eager"
                    alt="Imagem de perfil"
                />
            </div>
            <p>@VintraDev</p>
        </div>
    )
}