import { Loading } from "solid-js";

export default function ContainerFiles() {
  return (
    <div class="rounded-md bg-[#0A0A0B] h-full">
      <Loading fallback={null}>
        <h1 class='text-gray-700'>Files</h1>
      </Loading>
    </div>
  );
}
