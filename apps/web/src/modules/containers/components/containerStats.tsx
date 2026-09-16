import { createEffect, Loading } from "solid-js";
import { BASE_URL } from "../../../global/constants/network";

export default function ContainerStats(props: any) {
  createEffect(
    () => props?.id,
    (id) => {
      if (!id) return;

      const es = new EventSource(
        `${BASE_URL}/containers/getContainerResourceUsageStatsById/${id}`
      );

      es.onmessage = (event) => {
        console.log(event.data);
      };

      es.onerror = (err) => {
        console.error("SSE error:", err);
        es.close();
      };

    //   return () => {
    //     es.close();
    //   };
     }
  );

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full">
      <Loading fallback={null}>
        <h1 class="text-gray-700">Stats dsada</h1>
      </Loading>
    </div>
  );
}
