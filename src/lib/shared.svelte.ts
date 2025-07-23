import { LocalStorage } from "./storage.svelte";

export const department = new LocalStorage("department", { value: 0 });