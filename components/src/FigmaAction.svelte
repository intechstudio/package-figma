<svelte:options customElement={{tag: 'figma-action', shadow: 'none'}} />
<script>
  import { AtomicInput, AtomicSuggestions } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let selectValue = "";
  let targetValue = "";
  let value = "";
  let currentCodeValue = "";
  let ref;
  let suggestionElement;

  function handleConfigUpdate(config) {
    const regex =
        /^gps\("package-figma", "(all|selected)", "(opacity|cornerRadius)", \s*([^,]+)\)$/;
    if (currentCodeValue != config.script){
        currentCodeValue = config.script;
        const match = config.script.match(regex);
        if (match) {
          selectValue = match[1];
          targetValue = match[2];
          value = match[3];
        }
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
  });

  $: selectValue, targetValue, value, function() {
    var code = `gps("package-figma", "${selectValue}", "${targetValue}", ${value})`;
    if (currentCodeValue != code){
        currentCodeValue = code;    
        const event = new CustomEvent("updateCode", {
            bubbles: true,
            detail: { script: String(code) },
        });
        if (ref){
            ref.dispatchEvent(event);
        }
    }
  }()
</script>

<select-voice-channel 
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
    <div class="w-full flex">
      <div class="atomicInput" style="width: 80%;">
          <div class="text-gray-500 text-sm pb-1">Channel ID</div>
          <AtomicInput
              inputValue={selectValue}
              suggestions={[{info: "All object", value : "all"}, {info: "Selected object", value : "selected"}]}
              suggestionTarget={suggestionElement}
              on:change={(e) => {
                  selectValue = e.detail;
              }}/>
      </div>
      <div class="atomicInput" style="width: 80%;">
          <div class="text-gray-500 text-sm pb-1">Channel ID</div>
          <AtomicInput
              inputValue={targetValue}
              suggestions={[{info: "Opacity", value : "opacity"}, {info: "Corner Radius", value : "cornerRadius"}]}
              suggestionTarget={suggestionElement}
              on:change={(e) => {
                  targetValue = e.detail;
              }}/>
      </div>
      <div class="atomicInput" style="width: 80%;">
          <div class="text-gray-500 text-sm pb-1">Channel ID</div>
          <AtomicInput
              inputValue={value}
              suggestions={[]}
              suggestionTarget={suggestionElement}
              on:change={(e) => {
                  value = e.detail;
              }}/>
      </div>
    </div>

    <AtomicSuggestions bind:component={suggestionElement} />
</select-voice-channel>