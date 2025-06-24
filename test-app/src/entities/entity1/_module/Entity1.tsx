import { onePlusOne } from "../../../shared/utils";

export function Entity1() {
  const res = onePlusOne();

  return <div>Entity1 {res}</div>;
}
