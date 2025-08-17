// Unit tests for cursorSecurity module
import assert from 'assert';

// We need to import module after configuring env for predictable secrets & thresholds
process.env.CURSOR_SECRET = 'unit_test_primary_secret_1234567890';
process.env.CURSOR_SECRET_SECONDARY = 'unit_test_secondary_secret_0987654321';
process.env.CURSOR_INVALID_THRESHOLD = '3'; // low threshold for tests
process.env.CURSOR_ABUSE_COOLDOWN_MS = '500';

const mod = await import('../../security/cursorSecurity.js');
const { encodeCursor, decodeCursor, WEAK_CURSOR_SECRET, INVALID_CURSOR_THRESHOLD, isCursorAbuse, isInCursorCooldown, getIpInvalidCount, shouldAutoDegrade } = mod;

(async () => {
  try {
    // 1. Basic encode/decode round trip
    const c = encodeCursor(150, 42);
    const dec = decodeCursor(c, '1.1.1.1');
    assert(dec && dec.score === 150 && dec.id === 42 && dec.signed, 'Signed decode failed');
    assert(!dec.rotated, 'Should not be rotated with primary secret');

    // 2. Rotation path: create cursor with secondary secret manually, ensure rotated flag
    // To simulate legacy cursor, build base + secondary HMAC like decode expects
    const crypto = (await import('crypto')).default;
    const base = '200|77';
    const legacySig = crypto.createHmac('sha256', process.env.CURSOR_SECRET_SECONDARY)
        .update(base).digest('base64').replace(/[^A-Za-z0-9+/]/g,'').slice(0,16);
    const legacyCursor = Buffer.from(base + '|' + legacySig).toString('base64');
    const legacyDec = decodeCursor(legacyCursor, '1.1.1.1');
    assert(legacyDec && legacyDec.rotated, 'Rotation decode should set rotated=true');

    // 3. Invalid signature increments invalid counters & returns null
    const badCursor = Buffer.from('300|55|WRONGSIG').toString('base64');
    const badDec = decodeCursor(badCursor, '2.2.2.2');
    assert(badDec === null, 'Bad signature should decode to null');

  // 4. Abuse threshold logic (strict >). At threshold: still not abusive.
  assert(INVALID_CURSOR_THRESHOLD === 3, 'Threshold env not applied');
  assert(!isCursorAbuse('2.2.2.2'), 'Should not be abuse before threshold');
  for(let i=0;i<3;i++){ decodeCursor(badCursor, '9.9.9.9'); }
  assert(!isCursorAbuse('9.9.9.9'), 'Should NOT be abusive exactly at threshold (strict >)');
  // exceed threshold by one more invalid decode
  decodeCursor(badCursor, '9.9.9.9');
  assert(isCursorAbuse('9.9.9.9'), 'Should be abusive after exceeding threshold');

  // 5. Cooldown applied after exceeding threshold
  const cdMs = isInCursorCooldown('9.9.9.9');
  assert(cdMs > 0, 'Cooldown should be active after abuse detection (post-threshold)');

    // 6. getIpInvalidCount prunes old entries correctly: wait past cooldown window and ensure count shrinks
    await new Promise(r=>setTimeout(r, 600)); // > CURSOR_ABUSE_COOLDOWN_MS
    // Still within INVALID_CURSOR_WINDOW_MS (60s), count will remain same; simulate time jump by manually decoding more with different IP
    const before = getIpInvalidCount('9.9.9.9');
    decodeCursor(badCursor, '9.9.9.9');
    const after = getIpInvalidCount('9.9.9.9');
    assert(after === before + 1, 'Invalid count should increase with another bad decode');

  // 7. shouldAutoDegrade helper: strict > threshold and flag-gated behavior
  // default (flag not set): should be false even if count exceeds threshold
  assert.strictEqual(shouldAutoDegrade(3), false, 'Auto-degrade should be off by default');
  process.env.CURSOR_AUTO_DEGRADE = '1';
  assert.strictEqual(shouldAutoDegrade(3), false, 'Strict >: at threshold should be false');
  assert.strictEqual(shouldAutoDegrade(4), true, 'Should auto-degrade when count exceeds threshold with flag=1');
  process.env.CURSOR_AUTO_DEGRADE = '0';
  assert.strictEqual(shouldAutoDegrade(4), false, 'Flag=0 should prevent auto-degrade');

  console.log('CURSOR_SECURITY_UNIT_TESTS_SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('CURSOR_SECURITY_UNIT_TESTS_FAIL', e);
    process.exit(1);
  }
})();
