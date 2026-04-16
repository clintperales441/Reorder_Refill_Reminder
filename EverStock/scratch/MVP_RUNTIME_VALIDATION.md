# EverStock MVP Runtime Validation (Zurich)

## Goal
Validate this user flow in one pass:
1. Customer submits a catalog/order form.
2. A reminder record is auto-created.
3. A notification record is created for the customer.
4. Customer can Skip or Postpone the reminder.
5. Dashboard shows reminder status/date changes.

## Pre-checks
1. Verify active records:
   - Business Rule: Create Reminder
   - Business Rule: Create Reorder Reminder
   - Business Rule: Send Reminder Notification
   - Scheduled Script: Send Reminder Notifications
   - UI Actions: Skip Reminder, Postpone 3 Days
2. Confirm test user has:
   - An x_1984194_everstoc_user_preference record
   - opt_in_reminders = true
   - preferred_channel set (email or in_app)

## Test Script
1. Create order item as test user with x_1984194_everstoc_product populated.
2. Verify x_1984194_everstoc_reminder:
   - sys_user = test user
   - x_1984194_everstoc_product = ordered product
   - state = 1 (Active)
   - reminder_frequency populated
   - next_reminder_date populated
3. Verify x_1984194_everstoc_notification:
   - New row exists for the reminder
   - sys_user and product are populated
   - state = sent
4. Open reminder record and click Postpone 3 Days:
   - next_reminder_date advanced by 3 days
   - state remains Active
5. Open reminder record and click Skip Reminder:
   - state becomes 3 (Cancelled)
6. Reset state to Active for scheduler test and set next_reminder_date <= now.
7. Run scheduled job Send Reminder Notifications manually.
8. Verify:
   - New notification row inserted
   - reminder.last_triggered_date updated
   - reminder.next_reminder_date rolled forward by frequency

## Dashboard Validation
1. Open reminder_dashboard page.
2. Confirm reminder rows appear.
3. Confirm latest status/date reflects Skip/Postpone actions.

## Pass Criteria
- No server-side script errors in system logs.
- Reminder creation has no duplicates for same active user+product pair.
- Notification rows are created both on reminder insert and scheduled due processing.
- Skip/Postpone behavior is deterministic and state/date are correct.
