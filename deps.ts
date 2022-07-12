// Standard Library: https://deno.land/std
import * as Path from "https://deno.land/std@0.147.0/path/mod.ts";
import { readLines as ReadLines } from "https://deno.land/std@0.147.0/io/mod.ts";
import { walk as Walk } from "https://deno.land/std@0.147.0/fs/mod.ts";
import { z } from "https://deno.land/x/zod@v3.17.3/mod.ts";

// Cliffy: https://deno.land/x/cliffy
import {
  Cell,
  Row,
  Table,
} from "https://deno.land/x/cliffy@v0.24.2/table/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.24.2/command/mod.ts";
import {
  Input,
  Select,
} from "https://deno.land/x/cliffy@v0.24.2/prompt/mod.ts";
import {
  keypress,
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.24.2/keypress/mod.ts";
import {
  ansi as Ansi,
  colors as Colors,
} from "https://deno.land/x/cliffy@v0.24.2/ansi/mod.ts";

export const Cliffy = {
  Command,
  Input,
  Select,
  keypress,
  KeyPressEvent,
  Ansi,
  Colors,
  Cell,
  Row,
  Table,
};

export const stdLib = {
  Path,
  ReadLines,
  Walk,
};

export const zod = {
  z,
};
