import { Avatar } from "@/components/shared/avatar";
import { AvatarContainer } from "@/components/shared/avatar/avatar-container";
import Image from "next/image";
import Link from "next/link";

type Author = {
    name: string;
    avatar: string;
}

type PostCardProps = {
    slug: string;
    title: string;
    description: string;
    image: string;
    date: string;
    author: Author;
}

export function PostCard({ slug, title, description, image, date, author }: PostCardProps) {
    return (
        <Link className="w-full max-w-2xl rounded-3xl border border-gray-400 bg-gray-600 overflow-hidden transition-all hover:border-blue-300" href={`/blog/${slug}`}>
            {/* Post Content */}
            <div className="p-2 rounded-md overflow-hidden">
                {/* Image Container */}
                <div className="relative">
                    {/* Date conteiner */}
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gray-600 backdrop-blur-sm rounded-bl-[10px]">
                        <span className="text-gray-300 text-body-xs">{date}</span>
                    </div>
                    <Image
                        src={image}
                        alt={title}
                        width={288}
                        height={144}
                        className="w-full h-40 object-cover object-center rounded-xl"
                    />
                </div>

                {/* Post Info */}
                <div className="px-2 mt-4 space-y-4 ">
                    <h2 className="text-heading-sm text-gray-100 line-clamp-3">{title}</h2>

                    <p className="text-gray-300 text-body-sm line-clamp-3">
                        {description}
                    </p>

                    {/* Post Footer */}
                    <div className="flex items-center gap-3 border-t border-gray-400 py-4">
                        <AvatarContainer>
                            <Avatar.Image src={author.avatar} size="xs" alt={author.name} />
                            <Avatar.Title>
                                {author.name}
                            </Avatar.Title>
                        </AvatarContainer>
                    </div>
                </div>
            </div>
        </Link>
    )
}