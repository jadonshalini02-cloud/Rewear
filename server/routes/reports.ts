import { Router } from 'express';
import { db, saveDatabase, ReportRecord } from '../db/database.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/reports - submit a report on an item or user
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const reporterId = req.user!.id;
    const { reportedItemId, reportedUserId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Please select a reason for reporting.' });
    }

    if (!reportedItemId && !reportedUserId) {
      return res.status(400).json({ error: 'A reported item or user is required.' });
    }

    const newReport: ReportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reporterId,
      reportedItemId: reportedItemId || undefined,
      reportedUserId: reportedUserId || undefined,
      reason: reason.trim(),
      description: description?.trim() || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.reports.unshift(newReport);
    await saveDatabase();

    return res.status(201).json({
      message: 'Report submitted. Our community moderation team will review it shortly.',
      reportId: newReport.id,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// GET /api/reports - admin list all reports
router.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const enriched = db.reports.map((r) => {
      const reporter = db.users.find((u) => u.id === r.reporterId);
      const reportedItem = r.reportedItemId ? db.items.find((i) => i.id === r.reportedItemId) : null;
      const reportedUser = r.reportedUserId ? db.users.find((u) => u.id === r.reportedUserId) : null;

      return {
        ...r,
        reporter: reporter ? { id: reporter.id, name: reporter.name, email: reporter.email } : null,
        reportedItem: reportedItem ? { id: reportedItem.id, title: reportedItem.title, image: reportedItem.images[0] } : null,
        reportedUser: reportedUser ? { id: reportedUser.id, name: reportedUser.name, email: reportedUser.email } : null,
      };
    });

    return res.json({ reports: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve reports.' });
  }
});

// PATCH /api/reports/:id - update report status
router.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const report = db.reports.find((r) => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const { status, actionTaken } = req.body;
    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    if (status === 'RESOLVED' || status === 'DISMISSED') {
      report.resolvedAt = new Date().toISOString();
    }

    await saveDatabase();

    return res.json({ message: 'Report updated successfully.', report });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update report.' });
  }
});

export default router;
