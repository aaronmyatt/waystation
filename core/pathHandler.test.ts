/// <reference types="../types.d.ts" />
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.111.0/testing/asserts.ts";

import pathHandler from "./pathHandler.ts";

const BASIC_PATH = "/some/path.ts";
const PATH_WITH_LINE = "/some/path.ts:123";
const PATH_WITH_LINE_AND_COLUMN = "/some/path.ts:123:123";
const GREP_MATCH_PATH = "/some/path.ts:123:123: someMatchingLine(){";
const MALFORMED_INPUT_1 = "/some/path.ts: someMatchingLine(){";
const MALFORMED_INPUT_2 = "/some/path.ts:123 someMatchingLine(){";

Deno.test("falsy input yield null path parts object", () => {
  const result = pathHandler("");
  assertEquals(result, {
    name: "",
    path: "",
    line: 0,
    column: 0,
    body: "",
  });
});

Deno.test("arbitrary string returns as name|body|path", () => {
  const result = pathHandler("random string");
  assertEquals(result.name, "random string");
  assertEquals(result.body, "random string");
  assertEquals(result.path, "random string");
});

Deno.test("basic path returns as name|body|path", () => {
  const result = pathHandler(BASIC_PATH);
  assertEquals(result.name, BASIC_PATH);
  assertEquals(result.body, BASIC_PATH);
  assertStringIncludes(result.path, BASIC_PATH);
});

Deno.test("path with line returns updates line with correct value", () => {
  const result = pathHandler(PATH_WITH_LINE);
  assertEquals(result.name, BASIC_PATH);
  assertEquals(result.body, BASIC_PATH);
  assertStringIncludes(result.path, BASIC_PATH);
  assertEquals(result.line, 123);
  assertEquals(result.column, 0);
});

Deno.test("path with line&col updates line&col with correct value", () => {
  const result = pathHandler(PATH_WITH_LINE_AND_COLUMN);
  assertEquals(result.name, BASIC_PATH);
  assertEquals(result.body, BASIC_PATH);
  assertStringIncludes(result.path, BASIC_PATH);
  assertEquals(result.line, 123);
  assertEquals(result.column, 123);
});

Deno.test("grep like output updates body&name with snippet", () => {
  const result = pathHandler(GREP_MATCH_PATH);
  assertEquals(result.name, BASIC_PATH);
  assertEquals(result.body, " someMatchingLine(){");
  assertStringIncludes(result.path, BASIC_PATH);
  assertEquals(result.line, 123);
  assertEquals(result.column, 123);
});

Deno.test("malformed input returns as name|body|path", () => {
  const result = pathHandler(MALFORMED_INPUT_1);
  assertEquals(result.name, MALFORMED_INPUT_1);
  assertEquals(result.body, MALFORMED_INPUT_1);
  assertEquals(result.path, MALFORMED_INPUT_1);

  const result2 = pathHandler(MALFORMED_INPUT_2);
  assertEquals(result2.name, BASIC_PATH);
  assertEquals(result2.body, BASIC_PATH);
  assertStringIncludes(result2.path, BASIC_PATH);
});
