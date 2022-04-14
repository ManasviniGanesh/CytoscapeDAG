document.addEventListener("DOMContentLoaded", function() {
  fetch("./Test.json")
    .then((response) => {
      return response.json();
    })
    .then((jsonData) => {
      // Consts 
      var DEFAULT_TYPE = 0;
      var CULPRIT_TYPE = 1;
      var TSKUNQ_TYPE = 2;
      const typeColors = {
        0: "#485461", // default 
        1: "#9e768f", // culprit 
        2: "#a5a4cb", // taskUniqueId 
      };
      const typeBg = {
        0: "radial-gradient(315deg, #485461 0%, #28313b 74%);", // default
        1: "radial-gradient(315deg, #9e768f 0%, #9fa4c4 74%);", // culprit 
        2: "radial-gradient(315deg, #a5a4cb 0%, #bf3a30 74%);", // taskUniqueId 
      }

      // Get JSON Data 
      var nodesList = jsonData["path_from_dependent_activities"][0].nodes;
      var culpritsList = jsonData["dependent_activities"];
      var links = [...jsonData["path_from_dependent_activities"][0].links];
      var taskUniqueId = jsonData["task_unique_id"].toString();

      var nodes = {};
      var cpmStartTime = {};
      var cpmFinishTime = {};
      var edges = {};
      var culpritNodes = {};

      // get culprit nodes 
      for (let q = 0; q < culpritsList.length; ++q) {
        if (culpritsList[q].is_culprit) {
          culpritNodes[culpritsList[q].node] = true;
        }
      }

      // save nodes and edges
      for (let p = 0; p < nodesList.length; ++p) {
        nodes[nodesList[p].id] = {
          NAME: nodesList[p].NAME,
          CPM_START_TIME: nodesList[p].CPM_START_TIME,
          CPM_FINISH_TIME: nodesList[p].CPM_FINISH_TIME,
          ACTIVITY_TYPE: nodesList[p].ACTIVITY_TYPE,
          FREE_FLOAT: nodesList[p].FREE_FLOAT,
          PERCENT: nodesList[p].PERCENT,
          REPORTING_METHOD: nodesList[p].CPM_FINISH_TIME,
        }; // for records
        cpmStartTime[nodesList[p].id] = nodesList[p].CPM_START_TIME.split(" ")[0];
        cpmFinishTime[nodesList[p].id] = nodesList[p].CPM_FINISH_TIME.split(" ")[0];
        edges[nodesList[p].id] = new Set();
      }
      for (let j = 0; j < links.length; ++j) {
        let targets = edges[links[j].source];
        targets.add(links[j].target);
        edges[links[j].source] = targets;
      }

      // add elements 
      let leaf = null;
      var elements = [];
      //  elements.push({
      //     group: "nodes",
      //     data: {
      //       id: 'Task Unique Activity',
      //       type: TSKUNQ_TYPE,
      //       isLegend: true,
      //     }
      //   });
      // elements.push({
      //     group: "nodes",
      //     data: {
      //       id: 'Culprit Activity',
      //       type: CULPRIT_TYPE,
      //       isLegend: true,
      //     }
      //   });
      // elements.push({
      //     group: "nodes",
      //     data: {
      //       id: 'Other Activities',
      //       type: DEFAULT_TYPE,
      //       isLegend: true,
      //     }
      //   });
      // add edges
      for (let sourceNode in edges) {
        for (let targetNode of edges[sourceNode]) {
          elements.push({
            group: "edges",
            data: {
              id: sourceNode + " -> " + targetNode,
              source: sourceNode,
              target: targetNode,
              type: DEFAULT_TYPE
            }
          });
        }
        if (edges[sourceNode].size === 0) {
          leaf = sourceNode;
        }
      }
      // add nodes
      for (let nodeId in nodes) {
        elements.push({
          group: "nodes",
          data: {
            id: nodeId,
            parent: cpmStartTime[nodeId], // forms hierarchy using CPM start time
            cpmStartTime: cpmStartTime[nodeId],
            cpmFinishTime: cpmFinishTime[nodeId],
            type: culpritNodes[nodeId] ? CULPRIT_TYPE : (taskUniqueId === nodeId ? TSKUNQ_TYPE : DEFAULT_TYPE),
          }
        });
      }

      // START config
      var cy = cytoscape({
        container: $("#cy"),
        elements: elements,
        style: [
          {
            selector: "node",
            style: {
              label: "data(id)",
              "font-size": "14px",
              "text-wrap": "wrap",
              "font-family": "serif",
              color: "#f5f5f5",
              "text-valign": "center",
              "text-halign": "center",
              width: 120,
              height: 50,
              ghost: "yes",
              "ghost-offset-x": 3,
              "ghost-offset-y": 4,
              "ghost-opacity": 0.2,
              shape: "barrel",
              padding: "6px",
              "overlay-color": "#a5a5a5",
              "overlay-padding": "3px",
              "background-color": (el) => typeColors[el.attr("type")],
              "background-image":
                (el) => typeBg[el.attr("type")],
            }
          },

          {
            selector: ":parent",
            style: {
              "background-opacity": 0.1,
              label: ""
            }
          },

          {
            selector: "edge",
            style: {
              width: 3,
              "line-color": "#e9bcb7",
              "target-arrow-color": "#a0a0a0",
              "target-arrow-shape": "triangle",
              "curve-style": "taxi",
              "taxi-direction": "rightward",
              "overlay-color": "#a5a5a5",
              "overlay-padding": "10px"
            }
          },

          {
            selector: ":selected",
            style: {
              "background-color": (el) => typeColors[el.attr("type")],
              "background-image":
                (el) => typeBg[el.attr("type")],
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
              "background-color": (el) => typeColors[el.attr("type")],
              "background-image":
                (el) => typeBg[el.attr("type")],
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
      cy.nodeHtmlLabel(
        [
          {
            query: 'node',
            tpl: function(data) {
              if(!data.isLegend){
              return `<div><br/><br/><br/><br/><br/><br/>
<small><b>Start Time:</b>  ${data["cpmStartTime"]}</small>
<br/>
<small><b>Finish Time:</b>  ${data["cpmFinishTime"]}</small>
</div>`;
              }
              else {
                return '';
              }
            }
          }
        ]
      );
      let options = {
        name: "dagre",
        rankDir: "LR",
        leaves: [leaf],
        spacingFactor: 1.2,
        fit: true,
        directed: true,
        grid: true,
        maximal: true,
        depthSort: function(a, b) {
          return new Date(a.data("cpmStartTime")) - new Date(b.data("cpmStartTime"));
        },
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space,
        // animate: true, // whether to transition the node positions

        // animationDuration: 500, // duration of animation in ms if enabled
        // animateFilter: function (node, i) {
        //   return true;
        // }
      };
      cy.layout(options).run();

      // END config

      var tip = null;
      cy.on("mouseover", "edge", function(event) {
        let edge = event.target;
        let [source, target] = edge.id().split(" -> ");
        let ref = edge.popperRef(); // used only for positioning
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
            content.innerHTML = `<strong>${source} -> <span style="color: #7cffcb;">${target}</span></strong>`;
            return content;
          }
        });
        tip.show();
      });
      cy.on("mouseover", "node", function(event) {
        let node = event.target;
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
              <li><strong>ACTIVITY_TYPE | <span style="color: #7cffcb;">${nodes[node.id()].ACTIVITY_TYPE}</span></strong></li>
              <li><strong>FREE_FLOAT | <span style="color: #7cffcb;">${nodes[node.id()].FREE_FLOAT}</span></strong></li>
              <li><strong>PERCENT | <span style="color: #7cffcb;">${nodes[node.id()].PERCENT}</span></strong></li>
              <li><strong>REPORTING_METHOD | <span style="color: #7cffcb;">${nodes[node.id()].REPORTING_METHOD}</span></strong></li>
              </ul>`;
            return content;
          }
        });
        tip.show();
      });
      cy.on("mouseout", "edge", function(event) {
        if (tip) {
          tip.destroy();
        }
      });
      cy.on("mouseout", "node", function(event) {
        if (tip) {
          tip.destroy();
        }
      });
      cy.autolock(true);
    });
});
