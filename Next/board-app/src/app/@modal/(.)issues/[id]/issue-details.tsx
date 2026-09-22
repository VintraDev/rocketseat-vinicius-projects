import { ArchiveIcon } from 'lucide-react';
import { Suspense } from 'react';
import { IssueCommentForm } from '@/app/issues/[id]/issue-comment-form';
import { IssueCommentsList } from '@/app/issues/[id]/issue-comments/issue-comments';
import { IssueCommentsSkeleton } from '@/app/issues/[id]/issue-comments/issue-comments-skeleton';
import { IssueLikeButton } from '@/app/issues/[id]/issue-like-button';
import { getIssue } from '@/http/get-issue';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { createComment } from '@/http/create-comment';

interface IssueDetailsProps {
  issueId: string;
}

const statusLabels = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
} as const;

export async function IssueDetails({ issueId }: IssueDetailsProps) {
  const issue = await getIssue({ id: issueId });

  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const isAuthenticated = !!session?.user;

  async function handleCreateComment(text: string) {
    'use server';

    await createComment({ issueId, text });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="bg-navy-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
          <ArchiveIcon className="size-3" />
          {statusLabels[issue.status]}
        </span>

        <IssueLikeButton issueId={issue.id} />
      </div>

      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">{issue.title}</h1>
        <p className="text-navy-100 text-sm leading-relaxed">
          {issue.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">Comments</span>

        <IssueCommentForm
          onCreateComment={handleCreateComment}
          isAuthenticated={isAuthenticated}
        />

        <div className="mt-3">
          <Suspense fallback={<IssueCommentsSkeleton />}>
            <IssueCommentsList issueId={issue.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
