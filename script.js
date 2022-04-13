document.addEventListener("DOMContentLoaded", function() {
  fetch("./Test.json")
    .then((response) => {
      return response.json();
    })
    .then((jsonData) => {
      var nodesList = jsonData["culprits_path_graph"][0].nodes;
      var nodes = {};
      var edges = {};
      // save nodes and edges
      for (let p = 0; p < nodesList.length; ++p) {
        nodes[nodesList[p].id] = {
          NAME: nodesList[p].NAME,
          CPM_START_TIME: nodesList[p].CPM_START_TIME,
          CPM_FINISH_TIME: nodesList[p].CPM_FINISH_TIME
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
          group: "nodes",
          data: {
            id: nodeId
          }
        });
      }
      // add edges
      for (let sourceNode in edges) {
        for (let targetNode of edges[sourceNode]) {
          elements.push({
            group: "edges",
            data: {
              id: sourceNode + " -> " + targetNode,
              source: sourceNode,
              target: targetNode
            }
          });
        }
      }

      // MANU START config
      var cy = cytoscape({
        container: $("#cy"),
        elements: elements,
        style: [
          {
            selector: "node",
            style: {
              label: "data(id)",
              "text-wrap": "wrap",
              "font-family": "serif",
              color: "#f5f5f5",
              "text-valign": "center",
              "text-halign": "center",
              width: 100,
              height: 50,
              ghost: "yes",
              "ghost-offset-x": 3,
              "ghost-offset-y": 4,
              "ghost-opacity": 0.2,
              shape: "barrel",
              padding: "6px",
              "overlay-color": "#a5a5a5",
              "overlay-padding": "3px",
              "background-color": "#485461",
              "background-image":
                "radial-gradient(315deg, #485461 0%, #28313b 74%);"
            }
          },

          {
            selector: "edge",
            style: {
              width: 3,
              "line-color": "#e9bcb7",
              "target-arrow-color": "#a0a0a0",
              "target-arrow-shape": "triangle",
              "curve-style": "unbundled-bezier",
              "overlay-color": "#a5a5a5",
              "overlay-padding": "5px"
            }
          },

          {
            selector: ":selected",
            style: {
              "background-color": "#9e768f",
              "background-image":
                "radial-gradient(315deg, #9e768f 0%, #9fa4c4 74%);",
              "border-color": "#ccc",
              "border-opacity": "0.85",
              "border-width": "2px",
              color: "#fff",
              "line-color": "#9e768f",
              "target-arrow-color": "#EF9D34",
              "source-arrow-color": "#EF9D34"
            }
          },

          {
            selector: ":active",
            style: {
              "background-color": "#a5a4cb",
              "background-image":
                "radial-gradient(315deg, #a5a4cb 0%, #bf3a30 74%);",
              "border-color": "#f5f5f5",
              "border-opacity": "0.85",
              "border-width": "2px",
              color: "#fff",
              "line-color": "#a5a4cb",
              "target-arrow-color": "#EF9D34",
              "source-arrow-color": "#EF9D34"
            }
          }
        ]
      });
      let options = {
        name: "circle",
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space,
        animate: true, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animateFilter: function(node, i) {
          return true;
        } // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      };
      cy.layout(options).run();
      cy.autolock(true);
      // MANU END config
      var tip = null;
      cy.on("mouseout", "node", function(event) {
        tip.destroy();
      });
      cy.on("mouseover", "node", function(event) {
        let node = event.target;
        // let node = cy.nodes().first();

        let ref = node.popperRef(); // used only for positioning

        // A dummy element must be passed as tippy only accepts dom element(s) as the target
        // https://atomiks.github.io/tippyjs/v6/constructor/#target-types
        let dummyDomEle = document.createElement("div");
        if (tip != null) {
          tip.destroy();
        }
        tip = new tippy(dummyDomEle, {
          // tippy props:
          getReferenceClientRect: ref.getBoundingClientRect, // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
          trigger: "manual", // mandatory, we cause the tippy to show programmatically.
          // custom props
          placement: "right",
          arrow: false,
          allowHTML: true,
          followCursor: true,
          content: () => {
            let content = document.createElement("div");
            content.innerHTML = `
            <ul>
            <li><strong>Activity Name | <span style="color: #7cffcb;">${nodes[node.id()].NAME
              }</span></strong></li>
            <li><strong>CPM Start Time | <span style="color: #7cffcb;">${nodes[node.id()].CPM_START_TIME
              }</span></strong></li>
            <li><strong>CPM Finish Time | <span style="color: #7cffcb;">${nodes[node.id()].CPM_FINISH_TIME
              }</span></strong></li>
              </ul>`;
            return content;
          }
        });

        tip.show();
      });
    });
  // $("#TITLE").text("Milestone Delay Analyser");
});
