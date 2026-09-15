import { Comment } from '@/components/comment';
import { formatDistanceToNow } from 'date-fns';
import { listIssueComments } from '@/http/list-issue-comments';

interface IssueCommentsListProps {
  issueId: string;
}

export async function IssueCommentsList({ issueId }: IssueCommentsListProps) {
  const { comments } = await listIssueComments({ issueId });

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        return (
          <Comment.Root key={comment.id}>
            <Comment.Avatar src={comment.author.avatar} />
            <Comment.Content>
              <Comment.Header>
                <Comment.Author>{comment.author.name}</Comment.Author>
                <Comment.Time>
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </Comment.Time>
              </Comment.Header>
              <Comment.Text>{comment.text}</Comment.Text>
            </Comment.Content>
          </Comment.Root>
        );
      })}
    </div>
  );
}
