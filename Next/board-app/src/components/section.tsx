import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

interface SectionRootProps extends ComponentProps<'div'> {}

function SectionRoot({ className, ...props }: SectionRootProps) {
  return (
    <div
      className={twMerge(
        'bg-navy-800 rounded-xl border-[0.5px] border-navy-500 pt-3 flex flex-col gap-1',
        className
      )}
    />
  );
}

interface SectionHeaderProps extends ComponentProps<'div'> {}

function SectionHeader({ className, ...props }: SectionHeaderProps) {
  return (
    <div
      className={twMerge('flex items-center justify-between px-3', className)}
      {...props}
    />
  );
}

interface SectionTitleProps extends ComponentProps<'span'> {}

function SectionTitle({ className, ...props }: SectionTitleProps) {
  return (
    <span
      className={twMerge(
        'bg-navy-700 rounded-lg px-3 py-1.5 flex items0center gap-2 text-xs',
        className
      )}
      {...props}
    />
  );
}

interface SectionIssueProps extends ComponentProps<'span'> {}

function SectionIssueCount({ className, ...props }: SectionIssueProps) {
  return (
    <span className={twMerge('text-xs text-navy-200', className)} {...props} />
  );
}

interface SectionContentProps extends ComponentProps<'div'> {}

function SectionContent({ className, ...props }: SectionContentProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col gap-2.5 overflow-y-scroll p-3',
        className
      )}
      {...props}
    />
  );
}

export const Section = {
  Root: SectionRoot,
  Header: SectionHeader,
  Title: SectionTitle,
  IsseuCount: SectionIssueCount,
  Content: SectionContent,
};
