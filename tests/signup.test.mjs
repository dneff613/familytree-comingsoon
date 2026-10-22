import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionState } from '../assets/signup-state.mjs';

test('blocks double submissions and ignores success before a submission', () => {
  let redirects = 0;
  const state = createSubmissionState(() => {}, () => redirects++);
  assert.equal(state.succeed(), false);
  assert.equal(state.begin(), true);
  assert.equal(state.begin(), false);
  assert.equal(redirects, 0);
  assert.equal(state.succeed(), true);
  assert.equal(redirects, 1);
  assert.equal(state.begin(), false);
  assert.equal(state.succeed(), false);
  assert.equal(redirects, 1);
});

test('failure permits an explicit retry without redirecting', () => {
  const changes = [];
  let redirects = 0;
  const state = createSubmissionState((...args) => changes.push(args), () => redirects++);
  state.begin();
  state.fail('Unable to confirm submission. Check your inbox before retrying.');
  assert.equal(redirects, 0);
  assert.deepEqual(changes.at(-1), ['idle', 'Unable to confirm submission. Check your inbox before retrying.']);
  assert.equal(state.begin(), true);
  assert.equal(state.succeed(), true);
  assert.equal(redirects, 1);
});

test('a late failure cannot undo an accepted submission', () => {
  const changes = [];
  const state = createSubmissionState((status) => changes.push(status), () => {});
  state.begin(); state.succeed(); state.fail('late error');
  assert.equal(changes.at(-1), 'success');
  assert.equal(state.begin(), false);
});
