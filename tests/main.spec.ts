import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { advanceGameTime, bootGameWithFrozenClock, expectFrameToMatch } from './determinism';

/**
 * Golden-master snapshots of the template's demo scene.
 *
 * Both cases run against a frozen engine clock (see ./determinism.ts), so what is captured is
 * decided entirely by how much *simulated* game time we ask for - not by how fast the machine
 * happened to be.
 *
 * The demo Player's script (src/player.ts) is:
 *
 *     actions.delay(2000);
 *     actions.repeatForever(ctx => {
 *       ctx.moveBy({ offset: vec(100, 0), duration: 1000 });   // leg 1: right
 *       ctx.moveBy({ offset: vec(0, 100), duration: 1000 });   // leg 2: down
 *       ctx.moveBy({ offset: vec(-100, 0), duration: 1000 });  // leg 3: left
 *       ctx.moveBy({ offset: vec(0, -100), duration: 1000 });  // leg 4: up
 *     });
 *
 * plus a 1000ms `FadeInOut` in-transition configured in src/main.ts. Hence the two timings
 * below: one before the patrol starts, one comfortably inside it.
 */

/** Player's constructor position, src/player.ts. */
const PLAYER_START = { x: 150, y: 150 };

/**
 * Long enough to finish the 1000ms FadeInOut in-transition, short enough to stay inside the
 * Player's 2000ms `actions.delay`. Captures the scene at rest.
 */
const SETTLE_MS = 1200;

/**
 * Past the FadeInOut *and* the 2000ms delay, landing 700ms into patrol leg 3 - i.e. the Player
 * is at roughly (180, 250) and actively moving. Deliberately mid-leg rather than near a leg
 * boundary, so the capture has ~300ms of slack on either side.
 *
 * This is the case that actually exercises Actions. If `moveBy` silently stops queueing - as it
 * does when handed an unrecognised options shape, since `isMoveByOptions()` requires a numeric
 * `duration` and `moveBy` falls through with no `else` and no `throw` when that check fails -
 * the actor simply never leaves PLAYER_START, and this case fails while a delay-only capture
 * would happily stay green.
 */
const MID_PATROL_MS = 4700;

/** Read the demo Player's live position straight out of the running engine. */
async function playerPosition(page: Page): Promise<{ x: number; y: number } | null> {
  return page.evaluate(() => {
    const engine = (window as any).___EXCALIBUR_DEVTOOL;
    const player = engine?.currentScene?.actors?.find((actor: any) => actor.name === 'Player');
    return player ? { x: player.pos.x, y: player.pos.y } : null;
  });
}

test('main page looks correct at rest', async ({ page }) => {
  await bootGameWithFrozenClock(page);
  await advanceGameTime(page, SETTLE_MS);

  // Still inside actions.delay(2000): the Player has not started patrolling yet.
  expect(await playerPosition(page)).toEqual(PLAYER_START);

  await expectFrameToMatch(page, 'main-page-at-rest.png');
});

test('main page looks correct mid patrol', async ({ page }) => {
  await bootGameWithFrozenClock(page);
  await advanceGameTime(page, MID_PATROL_MS);

  // Guard the Actions behaviour directly, not just via pixels: a silently-dropped moveBy leaves
  // the Player parked at its start position, which a pixel tolerance could otherwise absorb.
  const pos = await playerPosition(page);
  expect(pos, 'Player should exist in the start scene').not.toBeNull();
  expect(
    Math.abs(pos!.x - PLAYER_START.x) + Math.abs(pos!.y - PLAYER_START.y),
    'Player should have moved off its start position - check moveBy() options in src/player.ts'
  ).toBeGreaterThan(10);

  await expectFrameToMatch(page, 'main-page-mid-patrol.png');
});
