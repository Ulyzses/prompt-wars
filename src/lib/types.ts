import type { Database } from "./database.types";

export type GameState = Database["public"]["Enums"]["GameState"];

export type Attack = Database["public"]["Tables"]["attacks"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];

export type Durations = {
  atk: number,
  def: number,
}