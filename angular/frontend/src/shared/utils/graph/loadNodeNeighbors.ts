import chroma from 'chroma-js';
import Graph from 'graphology';
import { Attributes } from 'graphology-types';
import { take } from 'rxjs';

import { calculateEdgeColor, getColorLinear } from './colorHelpers';
import { baseSize } from './graphDefaults';
import { ApiService } from '../../services/api.service';

export function loadNodeNeighbors(fetchLinks: ApiService['getLinks'], nodeKey: string, graph: Graph) {
  if (graph.getNodeAttribute(nodeKey, 'loaded')) {
    return;
  }
  graph.setNodeAttribute(nodeKey, 'loaded', true);

  const inheritedAttributes = structuredClone(graph.getNodeAttributes(nodeKey));

  graph.setNodeAttribute(nodeKey, 'label', nodeKey + ' [LOADING...]');
  graph.updateNodeAttribute(nodeKey, 'color', (color) => chroma(color).alpha(0.8).hex('rgba'));

  fetchLinks(nodeKey, inheritedAttributes['reverse'])
    .pipe(take(1))
    .subscribe({
      next: (response) => {
        const groupColor = getColorLinear(inheritedAttributes['color'], chroma.random().hex('rgba'));

        addLinksInCircle(response.links, graph, nodeKey, inheritedAttributes, groupColor);
      },
      error: (error) => {
        console.error(`Error loading neighbors for ${nodeKey}:`, error);
      },
      complete: () => {
        graph.setNodeAttribute(nodeKey, 'label', nodeKey);
        graph.updateNodeAttribute(nodeKey, 'color', (color) => chroma(color).alpha(1).hex('rgba'));
      },
    });
}

function addLinksInCircle(
  links: string[],
  graph: Graph,
  nodeKey: string,
  inheritedAttributes: Attributes,
  groupColor?: string
) {
  groupColor ??= getColorLinear(inheritedAttributes['color'], chroma.random().hex('rgba'));

  const edgeColor = calculateEdgeColor(inheritedAttributes['color'], groupColor);
  const childRadius = inheritedAttributes['size'] - Math.log2(inheritedAttributes['size']);

  const angle = (2 * Math.PI) / links.length;
  const radius = baseSize + Math.log2(links.length);

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const childX = inheritedAttributes['x'] + (radius + childRadius) * Math.cos(i * angle);
    const childY = inheritedAttributes['y'] + (radius + childRadius) * Math.sin(i * angle);
    const childDepth = inheritedAttributes['depth'] + 1;

    if (!graph.hasNode(link)) {
      graph.addNode(link, {
        reverse: inheritedAttributes['reverse'],
        depth: childDepth,
        size: childRadius,
        label: link,
        color: groupColor,
        x: childX,
        y: childY,
      });
    }

    if (!graph.hasEdge(nodeKey, link)) {
      graph.addEdge(nodeKey, link, {
        color: edgeColor,
        type: 'arrow',
      });
    }
  }
}
