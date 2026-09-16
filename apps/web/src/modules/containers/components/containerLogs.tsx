import { createEffect, Loading } from "solid-js";

export default function ContainerLogs(props: any) {
  const { params } = props;
  // const [logs, setLogs] = createSignal<any>();

  // createEffect(() => { },
  //   () => {
  //     if (!params?.id) return;
  //     const es = new EventSource(`http://100.65.87.119:8000/api/v1/containers/getContainerLogs/${params.id!}`)
  //     es.onmessage = (event) => {
  //       // const _rawLogs = JSON.parse(event.data);
  //       console.log(event.data)
  //       // setLogs([...logs(), _rawLogs]);
  //     }

  //     es.onerror = (err) => {
  //       es.close();
  //     };
  //     return () => {
  //       es.close();
  //     };
  //   });

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full">
      <Loading fallback={null}>
        <h1 class='text-gray-700'>
          Logs
        </h1>
      </Loading>
    </div>
  );
}
