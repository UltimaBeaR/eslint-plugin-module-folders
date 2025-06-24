import { Entity1 } from "../../../entities/entity1";
import { Entity2 } from "../../../entities/entity2";
import { onePlusOne } from "../../../shared/utils";
import { MainPage } from "../../mainPage";

export function OtherPage() {
  const res = onePlusOne();

  return (
    <div>
      OtherPage {res} <Entity1 />
      <Entity2 />
      <MainPage />
    </div>
  );
}
