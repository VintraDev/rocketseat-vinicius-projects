import { ArchiveIcon, MessageCircleIcon, ThumbsUpIcon } from 'lucide-react';
import { Section } from '@/components/section';
import { Card } from '@/components/card';
import { Button } from '@/components/button';

export default function Home() {
  return (
    <main className="grid grid-cols-4 gap-5 flex-1 items-stretch">
      <Section.Root>
        <Section.Header>
          <Section.Title>
            <ArchiveIcon className="size-3" />
            Backlog
          </Section.Title>

          <Section.IssueCount>16</Section.IssueCount>
        </Section.Header>

        {/* Content */}
        <Section.Content>
          <Card.Root>
            <Card.Header>
              <Card.Number>ECO-001</Card.Number>
              <Card.Title>Implementar cartão de crédito</Card.Title>
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
        </Section.Content>
      </Section.Root>
    </main>
  );
}
