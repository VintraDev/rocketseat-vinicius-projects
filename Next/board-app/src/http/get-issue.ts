import { IssueSchema } from '@/api/routes/get-issue';
import { clientEnv } from '@/env';
import { setTimeout } from 'node:timers/promises';

interface GetIssueParams {
  id?: string;
}

export async function getIssue({ id }: GetIssueParams) {
  'use cache';

  await setTimeout(1000);

  const url = new URL(`/api/issues/${id}`, clientEnv.NEXT_PUBLIC_API_URL);

  const response = await fetch(url);
  const data = await response.json();

  return IssueSchema.parse(data);
}
