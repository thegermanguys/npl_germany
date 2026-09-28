import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  auctionStatusLabel,
  franchiseCityParam,
  isAuctionStatus,
  nextPoolPlayerId,
  parseEuroAmount,
  purseWouldExceed,
} from "./auction.ts";

describe("auction status", () => {
  it("accepts the six pool states", () => {
    assert.equal(isAuctionStatus("in_auction_pool"), true);
    assert.equal(isAuctionStatus("pending_review"), true);
    assert.equal(isAuctionStatus("buyable"), false);
  });

  it("labels quietly", () => {
    assert.equal(auctionStatusLabel("in_auction_pool"), "In pool");
    assert.equal(auctionStatusLabel("sold"), "Sold");
  });
});

describe("nextPoolPlayerId", () => {
  it("starts at the first player", () => {
    assert.equal(nextPoolPlayerId(["a", "b", "c"], null), "a");
  });

  it("advances to the next in-pool player", () => {
    assert.equal(nextPoolPlayerId(["a", "b", "c"], "a"), "b");
    assert.equal(nextPoolPlayerId(["a", "b", "c"], "b"), "c");
  });

  it("stays on the last remaining player", () => {
    assert.equal(nextPoolPlayerId(["c"], "c"), "c");
    assert.equal(nextPoolPlayerId(["a", "b", "c"], "c"), "c");
  });

  it("picks the first remaining after the current player is sold", () => {
    assert.equal(nextPoolPlayerId(["b", "c"], "a"), "b");
    assert.equal(nextPoolPlayerId([], "a"), null);
  });
});

describe("purse", () => {
  it("warns when a sale would pass the cap", () => {
    assert.equal(purseWouldExceed(50_000, 40_000, 12_000), true);
    assert.equal(purseWouldExceed(50_000, 40_000, 10_000), false);
    assert.equal(purseWouldExceed(50_000, 0, 0), false);
  });

  it("reads a whole-euro price", () => {
    assert.equal(parseEuroAmount("2500"), 2500);
    assert.equal(parseEuroAmount("0"), 0);
    assert.equal(parseEuroAmount("-1"), null);
    assert.equal(parseEuroAmount("12.5"), null);
    assert.equal(parseEuroAmount(""), null);
  });
});

describe("franchise city param", () => {
  it("matches /franchises/[city]", () => {
    assert.equal(franchiseCityParam("Frankfurt"), "frankfurt");
  });
});
