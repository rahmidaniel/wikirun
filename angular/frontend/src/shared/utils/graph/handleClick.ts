import Graph from 'graphology';
import AbstractGraph from 'graphology-types';
import Sigma from 'sigma';

import { loadNodeNeighbors } from './loadNodeNeighbors';
import { ApiService } from '../../services/api.service';

export const handleClick = (fetchLinks: ApiService['getLinks'], renderer: Sigma<AbstractGraph>, graph: Graph) => {
  renderer.addListener('doubleClickNode', (e) => {
    loadNodeNeighbors(fetchLinks, e.node, graph);
  });
};
