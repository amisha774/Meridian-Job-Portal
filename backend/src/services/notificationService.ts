import mongoose from 'mongoose';
import { emitUserNotification } from '../config/socket.ts';
import { INotification, Notification } from '../models/Notification.ts';

interface CreateNotificationInput {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: INotification['type'];
  link?: string;
}

export async function createAndEmitNotification(
  input: CreateNotificationInput
): Promise<INotification> {
  const userIdStr = input.userId.toString();
  const notification = await Notification.create({
    user: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link || '',
  });

  emitUserNotification(userIdStr, notification.toObject());
  return notification;
}
