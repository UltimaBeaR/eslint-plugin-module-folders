import { MainPage } from "../../../pages/mainPage";
import { onePlusOne } from "../../../shared/utils";

export function Entity2() {
  const res = onePlusOne();

  return (
    <div>
      Entity2 {res} <MainPage />
    </div>
  );
}
