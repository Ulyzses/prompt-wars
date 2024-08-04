import { writable } from "svelte/store";
import type { Durations, Player, Session } from "./types";

export const opponents = writable<Player[]>([]);
export const player = writable<Player>();
export const session = writable<Session>();

export const durations = writable<Durations>();