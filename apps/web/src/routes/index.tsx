import { Title } from '@solidjs/meta';
import { createEffect } from "solid-js";
import { useNavigate } from '@solidjs/router';

export default function Home() {
  const navigate = useNavigate();

  createEffect(
    () => { },
    () => {
      navigate("/containers", { replace: true });
    });

  return null;
}
