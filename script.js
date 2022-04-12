document.addEventListener('DOMContentLoaded', function() {
  fetch("./Test.json")
    .then(response => {
      return response.json();
    })
    .then(jsonData => {
      var nodesList = jsonData["culprits_path_graph"][0].nodes;
      var nodes = {};
      var edges = {};
      // save nodes and edges 
      for (let p = 0; p < nodesList.length; ++p) {
        nodes[nodesList[p].id] = {
          "NAME": nodesList[p].NAME,
          "CPM_START_TIME": nodesList[p].CPM_START_TIME,
          "CPM_FINISH_TIME": nodesList[p].CPM_FINISH_TIME,
        }; // for records 
        edges[nodesList[p].id] = new Set();
      }
      var links = [...jsonData["culprits_path_graph"][0].links];
      for (let j = 0; j < links.length; ++j) {
        let targets = edges[links[j].source];
          targets.add(links[j].target);
          edges[links[j].source] = targets;
      }
      // add nodes 
      var elements = [];
      for (let nodeId in nodes) {
        elements.push({
          group: 'nodes',
          data: { 
            id: nodeId,
          }
        });
      }
      // add edges 
      for (let sourceNode in edges){
        for ( let targetNode of edges[sourceNode]) {
          elements.push({
          group: 'edges',
          data: {
            id: sourceNode + " -> " + targetNode,
            source: sourceNode,
            target: targetNode,
          }
        });
        }
      }
      
      // MANU START config 
      var cy = cytoscape({
        container: $('#cy'),
        elements: elements,
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            labelValign: 'middle',
            style: {
              "background-color": "#333",
              "background-opacity": 0.95,
              "text-wrap": "wrap",
              label: "data(id)",
              color: '#f5f5f5',
              padding: "6px",
              shape: "rectangle",
              width: 100,
              height: 50,
              "text-valign": "center",
              "text-halign": "center",
              'border-color': 'red',
              'border-opacity': '0.85',
            },
          },

          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#a0a0a0',
              'target-arrow-color': '#a0a0a0',
              'target-arrow-shape': 'triangle',
              'curve-style': 'unbundled-bezier',
            }
          },

          {
            selector: ':selected',
            style: {
              'background-color': '#FFC028',
              "background-opacity": 0.95,
              'line-color': '#FFC028',
              'target-arrow-color': '#FFC028',
              'source-arrow-color': '#FFC028',
              'border-color': '#ccc',
              'border-width': '2px',
              'border-opacity': '0.85',
              color: '#fff',
            }
          },

          {
            selector: ':active',
            style: {
              'background-color': '#FFC028',
              "background-opacity": 0.95,
              'line-color': '#FFC028',
              'target-arrow-color': '#FFC028',
              'source-arrow-color': '#FFC028',
              'border-color': '#f5f5f5',
              'border-width': '2px',
              'border-opacity': '0.85',
              color: '#fff',
            }
          },

        ],

        layout: {
          name: 'grid',

          fit: true, // whether to fit the viewport to the graph
          padding: 30, // the padding on fit
          boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
          avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
          nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
          spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
          radius: undefined, // the radius of the circle
          startAngle: 3 / 2 * Math.PI, // where nodes start in radians
          sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
          clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
          sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
          animate: true, // whether to transition the node positions
          animationDuration: 500, // duration of animation in ms if enabled
          animationEasing: undefined, // easing of animation if enabled
          animateFilter: function(node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
          ready: undefined, // callback on layoutready
          stop: undefined, // callback on layoutstop
          transform: function(node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
        }
      });
      // MANU END config 

      document.getElementById("title").textContent = "Explainable Schedule";
      cy.on('mouseover', 'node', function(event) {
        let node = event.target;
        $("#NODE_ID").text(node.id());
        $("#ACTIVITY_NAME").text(nodes[node.id()].NAME);
        $("#START_TIME").text(nodes[node.id()].CPM_START_TIME);
        $("#FINISH_TIME").text(nodes[node.id()].CPM_FINISH_TIME);
      });
    });
});