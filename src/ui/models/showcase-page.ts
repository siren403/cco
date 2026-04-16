export type ShowcaseTopic =
  | "all"
  | "auth"
  | "help"
  | "profiles"
  | "errors"
  | "doctor"
  | "flows"
  | "ink";

export function topicVisible(selected: ShowcaseTopic, target: Exclude<ShowcaseTopic, "all">): boolean {
  return selected === "all" || selected === target;
}
