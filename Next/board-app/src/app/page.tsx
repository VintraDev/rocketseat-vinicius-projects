import { ArchiveIcon } from 'lucide-react';
import { Section } from '@/components/section';

export default function Home() {
  return (
    <div className="max-w-[1620px] mx-auto p-10 flex flex-col gap-8 h-dvh">
      <div />

      <main className="grid grid-cols-4 gap-5 flex-1 items-stretch">
        <Section.Root>
          {/* Header */}
          <Section.Header className="flex items-center justify-between px-3">
            <Section.Title className="bg-navy-700 rounded-lg px-3 py-1.5 flex items0center gap-2 text-xs">
              <ArchiveIcon className="size-3" />
              Backlog
            </Section.Title>

            <Section.IsseuCount className="text-xs text-navy-200">
              23
            </Section.IsseuCount>
          </Section.Header>

          {/* Content */}
          <Section.Content className="flex flex-col gap-2.5 overflow-y-scroll p-3">
            <div>Card 1</div>
            <div>Card 2</div>
            <div>Card 3</div>
          </Section.Content>
        </Section.Root>
      </main>
    </div>
  );
}
