import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Notification } from '../models/Notification.ts';

export async function getNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user!._id }).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ user: req.user!._id, isRead: false }),
    ]);

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }
    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
}
