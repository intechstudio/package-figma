if (figma.editorType === "figma") {
  figma.showUI(__html__);
  figma.ui.onmessage = (msg) => {
    const targetValue = msg.value;
    const targetProperty = msg.targetProperty;
    const nodes: any =
      msg.selectedNodes == "all"
        ? figma.currentPage.children
        : figma.currentPage.selection;
    for (const node of nodes) {
      if (targetProperty in node) {
        node[targetProperty] = targetValue;
      }
    }
  };
}
