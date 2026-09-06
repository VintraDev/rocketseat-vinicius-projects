import { ArchiveIcon, MessageCircleIcon, ThumbsUpIcon } from 'lucide-react';
import { Section } from '@/components/section';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Metadata } from 'next';
import { listIssues } from '@/http/list-issues';

export const metadata: Metadata = {
  title: 'Board',
};

interface boardProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: boardProps) {
  const { q } = await searchParams;

  const issues = await listIssues({ search: q });
  return (
    <main className="grid grid-cols-4 gap-5 flex-1 items-stretch">
      <Section.Root>
        <Section.Header>
          <Section.Title>
            <ArchiveIcon className="size-3" />
            Backlog
          </Section.Title>

          <Section.IssueCount>{issues.backlog.length}</Section.IssueCount>
        </Section.Header>

        {/* Content */}
        <Section.Content>
          {issues.backlog.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-navy-300">
                No issues matching your filters
              </p>
            </div>
          ) : (
            issues.backlog.map((issues) => {
              return (
                <Card.Root key={issues.id}>
                  <Card.Header>
                    <Card.Number>{issues.issueNumber}</Card.Number>
                    <Card.Title>{issues.title}</Card.Title>
                  </Card.Header>
                  <Card.Footer>
                    <Button className="text-navy-100 flex items-center gap-2 rounded-lg px-2.5 py-1 bg-navy-600 cursor-pointer">
                      <ThumbsUpIcon className="size-3" />
                      <span className="text-sm">12</span>
                    </Button>

                    <Button>
                      <MessageCircleIcon className="size-3" />
                      <span className="text-sm">6</span>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              );
            })
          )}
        </Section.Content>
      </Section.Root>

      <Section.Root>
        <Section.Header>
          <Section.Title>
            <ArchiveIcon className="size-3" />
            To-do
          </Section.Title>

          <Section.IssueCount>{issues.todo.length}</Section.IssueCount>
        </Section.Header>

        {/* Content */}
        <Section.Content>
          {issues.todo.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-navy-300">
                No issues matching your filters
              </p>
            </div>
          ) : (
            issues.todo.map((issues) => {
              return (
                <Card.Root key={issues.id}>
                  <Card.Header>
                    <Card.Number>{issues.issueNumber}</Card.Number>
                    <Card.Title>{issues.title}</Card.Title>
                  </Card.Header>
                  <Card.Footer>
                    <Button className="text-navy-100 flex items-center gap-2 rounded-lg px-2.5 py-1 bg-navy-600 cursor-pointer">
                      <ThumbsUpIcon className="size-3" />
                      <span className="text-sm">12</span>
                    </Button>

                    <Button>
                      <MessageCircleIcon className="size-3" />
                      <span className="text-sm">6</span>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              );
            })
          )}
        </Section.Content>
      </Section.Root>

      <Section.Root>
        <Section.Header>
          <Section.Title>
            <ArchiveIcon className="size-3" />
            In Progress
          </Section.Title>

          <Section.IssueCount>{issues.in_progress.length}</Section.IssueCount>
        </Section.Header>

        {/* Content */}
        <Section.Content>
          {issues.in_progress.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-navy-300">
                No issues matching your filters
              </p>
            </div>
          ) : (
            issues.in_progress.map((issues) => {
              return (
                <Card.Root key={issues.id}>
                  <Card.Header>
                    <Card.Number>{issues.issueNumber}</Card.Number>
                    <Card.Title>{issues.title}</Card.Title>
                  </Card.Header>
                  <Card.Footer>
                    <Button className="text-navy-100 flex items-center gap-2 rounded-lg px-2.5 py-1 bg-navy-600 cursor-pointer">
                      <ThumbsUpIcon className="size-3" />
                      <span className="text-sm">12</span>
                    </Button>

                    <Button>
                      <MessageCircleIcon className="size-3" />
                      <span className="text-sm">6</span>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              );
            })
          )}
        </Section.Content>
      </Section.Root>

      <Section.Root>
        <Section.Header>
          <Section.Title>
            <ArchiveIcon className="size-3" />
            Done
          </Section.Title>

          <Section.IssueCount>{issues.done.length}</Section.IssueCount>
        </Section.Header>

        {/* Content */}
        <Section.Content>
          {issues.done.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-navy-300">
                No issues matching your filters
              </p>
            </div>
          ) : (
            issues.done.map((issues) => {
              return (
                <Card.Root key={issues.id}>
                  <Card.Header>
                    <Card.Number>{issues.issueNumber}</Card.Number>
                    <Card.Title>{issues.title}</Card.Title>
                  </Card.Header>
                  <Card.Footer>
                    <Button className="text-navy-100 flex items-center gap-2 rounded-lg px-2.5 py-1 bg-navy-600 cursor-pointer">
                      <ThumbsUpIcon className="size-3" />
                      <span className="text-sm">12</span>
                    </Button>

                    <Button>
                      <MessageCircleIcon className="size-3" />
                      <span className="text-sm">6</span>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              );
            })
          )}
        </Section.Content>
      </Section.Root>
    </main>
  );
}
