<svelte:options customElement={{tag: 'figma-preference', shadow: 'none'}} />
<script>
  import { Block, BlockBody, BlockRow, BlockTitle, MoltenButton, MoltenInput } from "@intechstudio/grid-uikit";
  import { onMount } from "svelte";

  let serverAddress = "";
  let clientConnected = "";

  // @ts-ignore
  const messagePort = createPackageMessagePort("package-figma");

  onMount(() => {
    messagePort.onmessage = (e) => {
      const data = e.data;
      if (data.type === "status") {
        serverAddress = data.serverAddress;
        clientConnected = data.clientConnected;
      }
    };
    messagePort.start();
    return () => {
      messagePort.close();
    }
  })
</script>

<main-app>
  <div class="px-4">
    <Block>
      <BlockTitle> Figma Demo </BlockTitle>
      <BlockBody>Server Address: {serverAddress}</BlockBody>
      <BlockBody>Client Status: {clientConnected}</BlockBody>
    </Block>
  </div>
</main-app>