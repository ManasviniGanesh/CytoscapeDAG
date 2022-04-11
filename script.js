document.addEventListener('DOMContentLoaded', function() {
  fetch("./Test.json")
    .then(response => {
      return response.json();
    })
    .then(jsonData => {
      var pred_graph = jsonData["pred_graph"];
      var nodes = {};
      for (let p = 0; p < pred_graph.length; ++p) {
        let currNodesList = pred_graph[p][0].culprit_path_graph.nodes;
        for (let curr = 0; curr < currNodesList.length; ++curr) {
          nodes[currNodesList[curr].id] = {
            "CPM_START_TIME": currNodesList[curr].CPM_START_TIME,
            "CPM_FINISH_TIME": currNodesList[curr].CPM_FINISH_TIME,
          }; // for records 
        }
      }
      var elements = [];
      for (let nodeId in nodes) {
        elements.push({
          data: { id: nodeId }
        });
      }
      document.getElementById("title").textContent = "Explainable Schedule";
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
              "text-halign": "center"
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
      var links = [];
      for (let p = 0; p < pred_graph.length; ++p) {
        links = [...links, ...pred_graph[p][0].culprit_path_graph.links];
      }
      for (let j = 0; j < links.length; ++j) {
        cy.add({
          group: 'edges',
          data: {
            id: links[j].source + "-" + links[j].target + "-" + j, // add j for repeatitive edges else nodes will be left alone 
            source: links[j].source,
            target: links[j].target
          }
        })
      }
      // MANU END config 
      cy.on('tap', 'node', function(event) {
        let node = event.target;
        console.log(JSON.stringify(nodes[node.id()]));
        $("#NODE_ID").text(node.id());
        $("#START_TIME").text(nodes[node.id()].CPM_START_TIME);
        $("#CPM_FINISH_TIME").text(nodes[node.id()].CPM_FINISH_TIME);
      });
    });
});