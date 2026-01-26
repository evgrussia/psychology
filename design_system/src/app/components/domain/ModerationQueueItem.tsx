import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertCircle, CheckCircle2, X, Eye, MessageCircle, Flag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';

interface ModerationQueueItemProps {
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'post' | 'comment' | 'review';
  timestamp: string;
  flags: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export function ModerationQueueItem({
  author,
  content,
  type,
  timestamp,
  flags,
  status: initialStatus,
}: ModerationQueueItemProps) {
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleApprove = () => {
    setStatus('approved');
    setShowReasonInput(false);
  };

  const handleReject = () => {
    if (!showReasonInput) {
      setShowReasonInput(true);
    } else if (reason) {
      setStatus('rejected');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success">Одобрено</Badge>;
      case 'rejected':
        return <Badge className="bg-danger">Отклонено</Badge>;
      default:
        return <Badge variant="outline">На проверке</Badge>;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'post':
        return 'Пост';
      case 'comment':
        return 'Комментарий';
      case 'review':
        return 'Отзыв';
    }
  };

  return (
    <Card className={`${status !== 'pending' ? 'opacity-70' : ''}`}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-10 h-10">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{author.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{getTypeLabel()}</span>
                <span>•</span>
                <span>{timestamp}</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Content Preview */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-foreground line-clamp-3">{content}</p>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Flag className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Жалобы:</span>
            {flags.map((flag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {flag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reason Input (when rejecting) */}
        {showReasonInput && status === 'pending' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-medium text-foreground">
              Причина отклонения
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Спам</SelectItem>
                <SelectItem value="inappropriate">Неуместный контент</SelectItem>
                <SelectItem value="offensive">Оскорбления</SelectItem>
                <SelectItem value="offtopic">Не по теме</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions */}
        {status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Просмотр
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-success hover:bg-success/90"
              onClick={handleApprove}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Одобрить
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleReject}
              disabled={showReasonInput && !reason}
            >
              <X className="w-4 h-4 mr-2" />
              Отклонить
            </Button>
          </div>
        )}

        {/* Confirmation Message */}
        {status !== 'pending' && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            status === 'approved' 
              ? 'bg-success/10 text-success' 
              : 'bg-danger/10 text-danger'
          }`}>
            {status === 'approved' ? (
              <><CheckCircle2 className="w-5 h-5" /><span className="text-sm font-medium">Контент одобрен и опубликован</span></>
            ) : (
              <><AlertCircle className="w-5 h-5" /><span className="text-sm font-medium">Контент отклонён: {reason}</span></>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
