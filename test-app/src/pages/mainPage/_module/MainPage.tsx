import { Entity1 } from "../../../entities/entity1";
import { Entity2 } from "../../../entities/entity2";
import { onePlusOne } from "../../../shared/utils";

export function MainPage() {
  const res = onePlusOne();

  return (
    <div>
      MainPage {res} <Entity1 />
      <Entity2 />
    </div>
  );
}
