import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { ensureMethod, mapError } from "../_lib/http"

export default withAuth(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const [usersR, subsR, revenueR, issuesR, recentR] = await Promise.all([
      sql`SELECT count(*)::int AS n FROM users`,
      sql`SELECT count(*)::int AS n FROM subscriptions WHERE status = 'active'`,
      sql`
        SELECT COALESCE(SUM(amount), 0)::int AS sum
        FROM payments
        WHERE status = 'success' AND paid_at >= date_trunc('month', NOW())
      `,
      sql`SELECT count(*)::int AS n FROM issues`,
      sql`
        SELECT s.id, s.created_at, s.total_amount, s.status,
               u.email,
               p.title_ru, p.title_uz
        FROM subscriptions s
        JOIN users u ON u.id = s.user_id
        JOIN publications p ON p.id = s.publication_id
        ORDER BY s.created_at DESC
        LIMIT 8
      `,
    ])
    res.status(200).json({
      stats: {
        users_count: usersR[0].n,
        active_subscriptions: subsR[0].n,
        monthly_revenue: revenueR[0].sum,
        issues_count: issuesR[0].n,
      },
      recent_subscriptions: recentR,
    })
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })
