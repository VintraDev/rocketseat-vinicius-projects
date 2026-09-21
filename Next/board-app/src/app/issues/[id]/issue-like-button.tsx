'use client';
import { LikeButton } from '@/components/like-button';
import { Skeleton } from '@/components/skeleton';
import { getIssueInteractions } from '@/http/get-issue-interactions';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

interface IssueLikeButtonProps {
  issueId: string;
}

export function IssueLikeButton({ issueId }: IssueLikeButtonProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['issue-likes', issueId],
    queryFn: () => getIssueInteractions({ issueIds: [issueId] }),
  });

  if (isLoading) {
    return <Skeleton className="h-7 w-16" />;
  }

  const interaction = data?.interactions[0];

  return (
    <LikeButton
      issueId={issueId}
      initialLikes={interaction?.likesCount ?? 0}
      initialLiked={interaction?.isLiked ?? false}
    />
  );
}
