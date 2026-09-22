import { CommentsListResponseSchema } from '@/api/routes/list-issue-comments';
import { clientEnv } from '@/env';
import { cacheLife, cacheTag } from 'next/cache';

interface ListIssueCommentsParams {
  issueId: string;
}

export async function listIssueComments({ issueId }: ListIssueCommentsParams) {
  'use cache';

  cacheLife('minutes');
  cacheTag(`issue-comment-${issueId}`);

  const url = new URL(
    `/api/issues/${issueId}/comments`,
    clientEnv.NEXT_PUBLIC_API_URL
  );

  const response = await fetch(url);
  const data = await response.json();

  return CommentsListResponseSchema.parse(data);
}
