/// <reference types="../types.d.ts" />

import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.111.0/testing/asserts.ts";
import Waystation, { EmptyWaystation } from "./waystation.ts";

const BASIC_PATH = "/some/path.ts";
const PATH_WITH_LINE_AND_COLUMN = "/some/path.ts:123:123";
const GREP_MATCH_PATH = "/some/path.ts:123:123: someMatchingLine(){";
const PATH_WITH_LINE = "/some/path.ts:123";

Deno.test("No args returns default, empty Waystation", () => {
  const waystation = Waystation();
  assertEquals(waystation.marks.length, EmptyWaystation.marks.length);
});

Deno.test("Waystations can be created with a name", () => {
  const name = "waystation naming";
  const waystation = Waystation(name);
  assertEquals(waystation.name, name);
});

Deno.test("Each run generates a unique uuid", () => {
  const waystation = Waystation();
  const waystation1 = Waystation();
  assertNotEquals(waystation, waystation1);
});

/*
A new Mark should be created when called with _any_ string
*/
Deno.test("Simple path", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  assertEquals(waystation.marks[0].path, BASIC_PATH);
});

Deno.test("Marks have a unique uuid", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  assertExists(waystation.marks[0].id);
  assertExists(waystation.marks[1].id);
  assertNotEquals(waystation.marks[0].id, waystation.marks[1].id);
});

/*
When called with a grep like output (appended with line and/or column)
Waystation should correctly unpack that information and add it to a new
Mark
*/
Deno.test("Path with line and col", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  assertEquals(waystation.marks[0].line, 123);
  assertEquals(waystation.marks[0].column, 123);
});

Deno.test("Line and col are not included in mark.path", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  assertNotEquals(waystation.marks[0].path, PATH_WITH_LINE_AND_COLUMN);
  assertStringIncludes(waystation.marks[0].path, BASIC_PATH);
});

Deno.test("Path with line and col and grep match line contents", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, GREP_MATCH_PATH);
  assertEquals(waystation.marks[0].line, 123);
  assertEquals(waystation.marks[0].column, 123);
});

Deno.test("Grep match line contents are not included in mark.path", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, GREP_MATCH_PATH);
  assertNotEquals(waystation.marks[0].path, GREP_MATCH_PATH);
  assertStringIncludes(waystation.marks[0].path, BASIC_PATH);
});

Deno.test("Path with line only", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE);
  assertEquals(waystation.marks[0].line, 123);
  assertEquals(waystation.marks[0].column, 0);
});

Deno.test("lists marks", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE);
  assert(Waystation.listMarks(waystation).length === 3);
});

Deno.test("replace marks", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  const mark = waystation.marks[0];
  waystation = Waystation.replaceMark(waystation, 0, {
    ...mark,
    body: "very descriptive",
  });
  assert(waystation.marks[0].body === "very descriptive");
});

Deno.test("edit marks", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.editMark(
    waystation,
    waystation.marks[0],
    "body",
    "very descriptive",
  );
  assertEquals(waystation.marks[0].body, "very descriptive");
});

/*
  Should we enforce property conformity?
  Will the type system do enough?
 */
// Deno.test("edit marks: wrong property throws error", () => {
//   let waystation = Waystation();
//   waystation = Waystation.newMark(waystation, BASIC_PATH);
//   assertThrows(() => Waystation.editMark(waystation, 0, 'description', 'very descriptive'), TypeError);
// });

Deno.test("reorders marks", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE);
  const lastItemIndex = waystation.marks.length - 1;
  const path = waystation.marks[0].path;
  assert(waystation.marks[0].path === path);
  waystation = Waystation.reorderMarks(waystation, 0, lastItemIndex);
  assert(waystation.marks[lastItemIndex].path === path);
});

Deno.test("reordering marks out of range returns original", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  const id = waystation.marks[0].id;
  waystation = Waystation.reorderMarks(waystation, 0, -1);
  assert(waystation.marks[0].id === id);

  waystation = Waystation.reorderMarks(waystation, 0, 1);
  assert(waystation.marks[0].id === id);
});

Deno.test("reordering marks: move up one level", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE);
  const mark = waystation.marks[1];
  waystation = Waystation.moveMarkUp(waystation, mark);
  assert(waystation.marks[0].id === mark.id);
});

Deno.test("reordering marks: move down one level", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE);
  const mark = waystation.marks[0];
  waystation = Waystation.moveMarkDown(waystation, mark);
  assert(waystation.marks[1].id === mark.id);
});

Deno.test("remove mark by index", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  assert(waystation.marks.length === 1);
  waystation = Waystation.removeMarkByIndex(waystation, 0);
  assert(waystation.marks.length === 0);
});

Deno.test("return mark path with path/col appended", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  assert(waystation.marks.length === 1);
  const path = Waystation.markWithPath(waystation.marks[0]);
  assert(path.endsWith(PATH_WITH_LINE_AND_COLUMN));
});

Deno.test("returns last mark in list", () => {
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  waystation = Waystation.newMark(waystation, BASIC_PATH);
  assert(waystation.marks.length === 2);
  const mark = Waystation.lastMark(waystation);
  assert(mark!.path.endsWith(BASIC_PATH));
});

Deno.test("adds note type resource to mark", () => {
  const RESOURCE_TEXT = "some text";
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  const mark = Waystation.lastMark(waystation);
  waystation = Waystation.newResource(waystation, mark!, "note", RESOURCE_TEXT);
  const updatedMark = Waystation.lastMark(waystation);
  assert(updatedMark!.resources!.length > 0);
  assertEquals(updatedMark!.resources![0].body, RESOURCE_TEXT);
});

Deno.test("removes resource by name", () => {
  const RESOURCE_TEXT = "some text";
  let waystation = Waystation();
  waystation = Waystation.newMark(waystation, PATH_WITH_LINE_AND_COLUMN);
  const mark = Waystation.lastMark(waystation);
  waystation = Waystation.newResource(
    waystation,
    mark!,
    "note",
    RESOURCE_TEXT,
    "File Context",
  );
  assertEquals(Waystation.lastMark(waystation)!.resources!.length, 1);
  waystation = Waystation.removeResourceByName(
    waystation,
    mark!,
    "File Context",
  );
  assertEquals(Waystation.lastMark(waystation)!.resources!.length, 0);
});

Deno.test('Waystation.addTag', () => {
  let waystation = Waystation();
  waystation = Waystation.addTag(waystation, "deno");
  assertEquals(waystation.tags.length, 1);
});

Deno.test('Waystation.addTag, if tag empty', () => {
  let waystation = Waystation();
  waystation = Waystation.addTag(waystation, "");
  assertEquals(waystation.tags.length, 0);
});