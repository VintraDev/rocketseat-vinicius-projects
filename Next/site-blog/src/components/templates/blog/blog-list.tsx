"use client";

import { Search } from "@/components/ui/search";
import { useSearchParams } from "next/navigation";
import { PostCard } from "./components/post-card";
import { PostGridCard } from "./components/post-grid-card";
import { Post } from "contentlayer/generated";
import { Inbox } from "lucide-react";

export type BlogListProps = {
    posts: Post[];
}

export function BlogList( { posts }: BlogListProps) {

    const searchParams = useSearchParams();
    const query =  searchParams?.get('q') ;
    const pageTitle = query ? `Resultados de busca para "${query}"` : 'Dicas e estratégias para impulsionar seu negócio';

    const postList = query
        ? posts.filter((post) =>
        post.title.toLowerCase()?.includes(query.toLowerCase())
    ) : posts;

    const hasPosts = postList.length > 0;

    return (
        <div className="flex flex-col py-24 grow h-full">
            <header className="pb-14">
                <div className="container space-y-6 flex flex-col items-start justify-between md:flex-row md:items-end">
                    <div className="flex flex-col gap-4">
                        {/* Tag */}
                        <span className="text-body-tag text-cyan-100 w-fit rounded-md text-center md:text-left py-2 px-4 bg-cyan-300">
                            BLOG
                        </span>
                        {/* Título */}
                        <h1 className="text-balance text-start md:text-left text-heading-lg md:text-heading-xl max-w-2xl text-gray-100">
                            {pageTitle}
                        </h1>
                    </div>
                    {/* Search */}
                    <Search />
                </div>
            </header>
            {/* Listagem de posts */}
            {
                hasPosts ? (
                    <PostGridCard>
                        {postList.map((post) => {
                            return (
                                <PostCard
                                    key={post._id}
                                    title={post.title}
                                    description={post.description}
                                    date={new Date(post.date).toLocaleDateString('pt-BR')}
                                    image={post.image}
                                    author={{
                                        avatar: post.author?.avatar,
                                        name: post.author?.name,
                                    }}
                                    slug={post.slug}
                                />
                            )
                        })}
                    </PostGridCard>
                ) : (
                    <div className="container px-8">
                        <div className="flex flex-col items-center justify-center gap-8 border-2 border-dashed border-gray-300 p-8 md:p-12 rounded-lg">
                            <Inbox className="w-12 h-12 text-cyan-100" />
                            <p className="text-gray-100 text-center">Nenhum post encontrado.</p>
                        </div>
                    </div>
                )}
        </div>
    )
}