import { LikeResponseSchema } from '@/api/routes/schemas/issue-like';
import { clientEnv } from '@/env';

interface ToggleLikeParams {
  issueId: string;
}

export async function toggleLike({ issueId }: ToggleLikeParams) {
  const url = new URL(
    `/api/issues/${issueId}/like`,
    clientEnv.NEXT_PUBLIC_API_URL
  );

  const response = await fetch(url, {
    method: 'POST',
  });

  const data = await response.json();

  return LikeResponseSchema.parse(data);
}
