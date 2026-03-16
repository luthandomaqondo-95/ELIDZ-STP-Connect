# Notifications System

## Overview
The notifications system allows admins (IDZ Science and Technology Park) to send communications to users, especially SMMEs. Notifications can include verification approvals, rejections, general announcements, and other important updates.

## Database Setup

1. Run the SQL script to create the notifications table:
   ```sql
   -- Run this in your Supabase SQL Editor
   -- File: mobile/database/create_notifications_table.sql
   ```

2. The table includes:
   - User targeting (user_id)
   - Notification content (title, message)
   - Notification types (verification_approved, verification_rejected, admin_message, etc.)
   - Read/unread status tracking
   - Related entity linking (for linking to specific verifications, opportunities, etc.)

## Notification Types

- `verification_approved` - SMME verification has been approved
- `verification_rejected` - SMME verification has been rejected
- `verification_pending` - Verification is pending review
- `admin_message` - General message from admin
- `announcement` - System-wide announcement
- `opportunity_update` - Update about an opportunity
- `system_alert` - Important system alert
- `other` - Other types of notifications

## Usage

### For Users (SMMEs)

1. **Accessing Notifications**
   - Navigate to the "Notifications" tab in the bottom navigation
   - Or access from Profile → Notifications menu item

2. **Viewing Notifications**
   - All notifications are displayed in chronological order (newest first)
   - Unread notifications are highlighted with an orange border
   - Notification badge shows unread count on the tab icon

3. **Marking as Read**
   - Tap a notification to mark it as read
   - Use "Mark All as Read" button to mark all notifications as read

4. **Deleting Notifications**
   - Tap the trash icon on any notification to delete it

### For Admins (Creating Notifications)

To create notifications, you can use the notification service:

```typescript
import { notificationService } from '@/services/notification.service';

// Example: Send verification approval notification
await notificationService.createNotification({
    user_id: 'user-uuid-here',
    title: 'Verification Approved',
    message: 'Congratulations! Your business verification has been approved. You can now access all SMME features.',
    type: 'verification_approved',
    related_entity_type: 'verification',
    related_entity_id: 'verification-uuid-here',
    created_by: 'admin-user-uuid-here'
});

// Example: Send verification rejection notification
await notificationService.createNotification({
    user_id: 'user-uuid-here',
    title: 'Verification Rejected',
    message: 'Your verification documents have been reviewed. Please review the feedback and resubmit.',
    type: 'verification_rejected',
    related_entity_type: 'verification',
    related_entity_id: 'verification-uuid-here',
    created_by: 'admin-user-uuid-here'
});

// Example: General admin message
await notificationService.createNotification({
    user_id: 'user-uuid-here',
    title: 'Important Update',
    message: 'We have an important announcement regarding upcoming events.',
    type: 'admin_message',
    created_by: 'admin-user-uuid-here'
});
```

**Note:** The `createNotification` method should typically be called from a server-side API endpoint or admin panel with proper authentication to ensure only admins can create notifications.

## Features

- ✅ Real-time unread count badge
- ✅ Mark individual notifications as read
- ✅ Mark all notifications as read
- ✅ Delete notifications
- ✅ Pull-to-refresh
- ✅ Color-coded notification types
- ✅ Icon indicators for different notification types
- ✅ Chronological ordering
- ✅ Empty state handling

## Integration Points

### Verification System
When verification status changes, notifications can be automatically created:
- When verification is approved → `verification_approved` notification
- When verification is rejected → `verification_rejected` notification

### Admin Panel
Admins can send notifications through:
- Admin API endpoints (to be implemented)
- Admin dashboard interface (to be implemented)

## Future Enhancements

- Push notifications for mobile devices
- Email notifications for important updates
- Notification preferences/settings
- Notification categories/filtering
- Batch notification sending
- Scheduled notifications

