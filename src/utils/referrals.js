import { q } from '../db.js';

export async function recordReferral(referrerId, referredEmail) {
  const res = await q('INSERT INTO referrals(referrer_id,referred_email) VALUES($1,$2) RETURNING id', [referrerId, referredEmail]);
  const referralId = res.rows[0].id;
  await q('INSERT INTO referral_activity(referral_id) VALUES($1)', [referralId]);
  return referralId;
}

export async function linkReferralAccount(referredEmail, userId) {
  const res = await q('UPDATE referrals SET referred_user_id=$1 WHERE referred_email=$2 RETURNING id', [userId, referredEmail]);
  return res.rows[0];
}

// Check eligibility: 9 completed for referrer AND at least one referral in last 3 months with 3+ completed
export async function isEligibleForFreeMaster(referrerId) {
  const r1 = await q('SELECT mixes_completed FROM loyalty WHERE user_id=$1', [referrerId]);
  const mixes = r1.rows[0]?.mixes_completed || 0;
  if (mixes < 9) return false;

  const r2 = await q(`
    SELECT ra.referred_projects_completed, r.created_at
    FROM referrals r
    JOIN referral_activity ra ON ra.referral_id = r.id
    WHERE r.referrer_id=$1
      AND r.created_at >= (NOW() - INTERVAL '3 months')
  `, [referrerId]);

  return r2.rows.some(row => (row.referred_projects_completed || 0) >= 3);
}
