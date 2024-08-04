import { writable } from "svelte/store";
import type { Attack, Durations, Player, Session } from "./types";

export const attacks = writable<Attack[]>([]);
export const opponents = writable<Player[]>([]);
export const player = writable<Player>();
export const session = writable<Session>();

export const durations = writable<Durations>();
