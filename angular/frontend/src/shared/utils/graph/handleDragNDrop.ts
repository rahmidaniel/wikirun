import Graph from 'graphology';
import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
import AbstractGraph from 'graphology-types';
import Sigma from 'sigma';

export function handleDragNDrop(
  renderer: Sigma<AbstractGraph>,
  graph: Graph,
  layout: FA2LayoutSupervisor,
  getSimRunning: () => boolean
) {
  let draggedNode: string | null = null;
  let isDragging = false;
  let layoutWasRunning = false;

  renderer.on('downNode', (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, 'highlighted', true);

    layoutWasRunning = layout.isRunning();
    if (layoutWasRunning) {
      layout.stop();
    }
  });

  renderer.getMouseCaptor().on('mousemovebody', (e) => {
    if (!isDragging || !draggedNode) {
      return;
    }

    const pos = renderer.viewportToGraph(e);

    graph.setNodeAttribute(draggedNode, 'x', pos.x);
    graph.setNodeAttribute(draggedNode, 'y', pos.y);

    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });

  renderer.getMouseCaptor().on('mouseup', () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, 'highlighted');
      // loadNeighbors(draggedNode, graph)
    }
    isDragging = false;
    draggedNode = null;

    if (layoutWasRunning && getSimRunning() && !layout.isRunning()) {
      layout.start();
    }

    layoutWasRunning = false;
  });

  renderer.getMouseCaptor().on('mousedown', () => {
    if (!renderer.getCustomBBox()) {
      renderer.setCustomBBox(renderer.getBBox());
    }
  });
}
