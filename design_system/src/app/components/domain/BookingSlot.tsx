import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface BookingSlotProps {
  specialist: {
    name: string;
    avatar?: string;
    title: string;
  };
  date: string;
  time: string;
  duration: string;
  type: 'online' | 'offline';
  price?: string;
  available: boolean;
  location?: string;
}

export function BookingSlot({
  specialist,
  date,
  time,
  duration,
  type,
  price,
  available,
  location,
}: BookingSlotProps) {
  return (
    <Card className={`${!available ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Specialist Info */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={specialist.avatar} alt={specialist.name} />
            <AvatarFallback>{specialist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground">{specialist.name}</h4>
                  <p className="text-sm text-muted-foreground">{specialist.title}</p>
                </div>
                {!available && (
                  <Badge variant="secondary">Занято</Badge>
                )}
              </div>
            </div>

            {/* Slot Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{time} · {duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {type === 'online' ? (
                  <><Video className="w-4 h-4" /><span>Онлайн</span></>
                ) : (
                  <><MapPin className="w-4 h-4" /><span>{location || 'Офлайн'}</span></>
                )}
              </div>
              {price && (
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span>{price}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1"
                disabled={!available}
              >
                {available ? 'Записаться' : 'Недоступно'}
              </Button>
              <Button variant="outline" size="icon">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
