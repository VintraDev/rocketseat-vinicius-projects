import { Button } from '@/components/button';
import { getIssue } from '@/http/get-issue';
import { ArchiveIcon, MoveLeftIcon, ThumbsUpIcon } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { IssueCommentsList } from './issue-comments/issue-comments';

interface IssuePageProps {
  params: Promise<{ id: string }>;
}

// Deduplicação automática

export const generateMetadata = async ({
  params,
}: IssuePageProps): Promise<Metadata> => {
  const { id } = await params;

  const issue = await getIssue({ id });

  return {
    title: `Issue ${issue.title}`,
  };
};

const statusLabels = {
  backlog: 'Backlog',
  todo: 'To do',
  in_progress: 'In Progress',
  done: 'Done',
} as const;

export default async function IssuePage({ params }: IssuePageProps) {
  const { id } = await params;

  const issue = await getIssue({ id });

  return (
    <main className="max-w-232.5 mx-auto w-full flex flex-col gap-4 p-6 bg-navy-800 border-[0.5px] border-navy-500 rounded-xl">
      <Link
        href="/"
        className="flex items-center gap-2 text-navy-200 hover:text-navy-100"
      >
        <MoveLeftIcon className="size-4" />
        <span>Back to board</span>
      </Link>

      <div className="flex items-center gap-2">
        <span className="bg-navy-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
          <ArchiveIcon className="size-3" />
          {statusLabels[issue.status]}
        </span>

        <Button className="text-navy-100 flex items-center gap-2 rounded-lg px-2.5 py-1 bg-navy-600 cursor-pointer">
          <ThumbsUpIcon className="size-3" />
          <span className="text-sm">12</span>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">{issue.title}</h1>
        <p className="text-navy-100 text0sm leading-relaxed">
          {issue.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold"></span>

        <form action=""></form>

        <div className="mt-3">
          <IssueCommentsList issueId={issue.id} />
        </div>
      </div>
    </main>
  );
}
