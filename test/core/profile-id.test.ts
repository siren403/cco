import { expect, test } from "bun:test";
import { DomainError } from "../../src/core/errors/domain-error.ts";
import { assertProfileIdUsable } from "../../src/core/services/profile-id.ts";

test("profile ids reject reserved names", () => {
  expect(() => assertProfileIdUsable("host")).toThrowError(DomainError);
  expect(() => assertProfileIdUsable("auth")).toThrowError(DomainError);
});

test("profile ids reject invalid characters", () => {
  expect(() => assertProfileIdUsable("Work")).toThrowError(DomainError);
  expect(() => assertProfileIdUsable("bad name")).toThrowError(DomainError);
});

test("profile ids accept simple local aliases", () => {
  expect(() => assertProfileIdUsable("work")).not.toThrow();
  expect(() => assertProfileIdUsable("backup_2")).not.toThrow();
});
