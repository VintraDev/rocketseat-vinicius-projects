'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, MessageCirclePlusIcon } from 'lucide-react';
import z from 'zod';
import { authClient } from '@/lib/auth-client';

const createCurrentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
});

type createCurrentSchema = z.infer<typeof createCurrentSchema>;

interface IssueCommentFormProps {
  onCreateComment: (text: string) => Promise<void>;
  isAuthenticated: boolean;
}

export function IssueCommentForm({
  onCreateComment,
  isAuthenticated,
}: IssueCommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<createCurrentSchema>({
    resolver: zodResolver(createCurrentSchema),
  });

  async function handleCreateComment(data: createCurrentSchema) {
    await onCreateComment(data.text);

    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(handleCreateComment)}
      className="relative w-full"
    >
      <Input
        className="bg-navy-700 h-11 pr-24 w-full"
        placeholder={
          !isAuthenticated ? 'Sign in to comment' : 'Leave a comment...'
        }
        disabled={isSubmitting || !isAuthenticated}
        {...register('text')}
      />

      {errors.text && (
        <span className="text-xs text-red-400 mt-1">{errors.text.message}</span>
      )}
      <button
        type="submit"
        disabled={isSubmitting || !isAuthenticated}
        className="flex items-center gap-2 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-indigo-300 cursor-pointer disabled:opacity-50"
      >
        Publish
        {isSubmitting ? (
          <Loader2Icon className="size-3 animate-spin" />
        ) : (
          <MessageCirclePlusIcon className="size-3" />
        )}
      </button>
    </form>
  );
}
