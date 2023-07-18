const svg1 = d3.create("svg").attr("viewBox", [0, 0, 3000, 1000]);

let visited = [];

//solves the quadratic equations of the circle and the line(arrow) to check if they intersect or not
function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const a = dx * dx + dy * dy;
  const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
  const c =
    cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;
  const disc = b * b - 4 * a * c;
  if (disc <= 0) {
    return false;
  }
  const sqrtdisc = Math.sqrt(disc);
  const t1 = (-b + sqrtdisc) / (2 * a);
  const t2 = (-b - sqrtdisc) / (2 * a);
  if ((0 < t1 && t1 < 1) || (0 < t2 && t2 < 1)) {
    return true;
  }
  return false;
}

function fillFormWithPresetData1() {
  document.getElementById("nodesInput").value = "A, B, C, D";
  document.getElementById("edgesInput").value = "A B, B C, C D";
  document.getElementById("startNodeInput").value = "A";
  document.getElementById("endNodeInput").value = "D";
}

const presetDataButton1 = document.getElementById('presetDataButton1');
presetDataButton1.addEventListener('click', fillFormWithPresetData1);


function fillFormWithPresetData2() {
    document.getElementById("nodesInput").value = "A, B, C, D, E, F, G";
    document.getElementById("edgesInput").value = "A B, C F, E F, D G";
    document.getElementById("startNodeInput").value = "B";
    document.getElementById("endNodeInput").value = "G";
  }
  
  const presetDataButton2 = document.getElementById('presetDataButton2');
  presetDataButton2.addEventListener('click', fillFormWithPresetData2);

function appendCircles(svg1, graph) {
  const nodes = graph.nodes;
  const edges = graph.edges;
  const circleSpacing = 200;
  const circleRadius = 50;
  const circles = {};

  nodes.forEach((node, index) => {
    const cx = index * circleSpacing + circleRadius;
    const circle = svg1
      .append("circle")
      .attr("cx", cx)
      .attr("cy", "500")
      .attr("r", circleRadius)
      .attr("fill", "green");
    circles[node] = circle;
    svg1
      .append("text")
      .attr("x", cx)
      .attr("y", "500")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(node)
      .attr("font-family", "Arial")
      .attr("font-size", "40px")
      .attr("fill", "black");
  });

  edges.forEach(([source, target]) => {
    const sourceCircle = circles[source];
    const targetCircle = circles[target];
    if (sourceCircle && targetCircle) {
      let x1 = parseFloat(sourceCircle.attr("cx")) + circleRadius;
      let y1 = parseFloat(sourceCircle.attr("cy"));
      let x2 = parseFloat(targetCircle.attr("cx")) - circleRadius;
      let y2 = parseFloat(targetCircle.attr("cy"));
      let intersects = false;
      nodes.forEach((node) => {
        if (node !== source && node !== target) {
          const circle = circles[node];
          const cx = parseFloat(circle.attr("cx"));
          const cy = parseFloat(circle.attr("cy"));
          if (lineIntersectsCircle(x1, y1, x2, y2, cx, cy, circleRadius)) {
            intersects = true;
          }
        }
      });
      if (intersects) {
        // add curve to avoid overlapping
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const norm = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / norm;
        const perpY = dx / norm;
        const offset = 100;
        const controlPoint1X = x1 + perpX * offset;
        const controlPoint1Y = y1 + perpY * offset;
        const controlPoint2X = x2 + perpX * offset;
        const controlPoint2Y = y2 + perpY * offset;
        svg1
          .append("path")
          .attr(
            "d",
            `M${x1},${y1} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${x2},${y2}`
          )
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("marker-end", "url(#arrowhead)");
      } else {
        svg1
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "black")
          .attr("marker-end", "url(#arrowhead)");
      }
    }
  });

  return circles;
}
//arrowhead marker
svg1
  .append("defs")
  .append("marker")
  .attr("id", "arrowhead")
  .attr("viewBox", "-10 -10 20 20")
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)
  .append("path")
  .attr("d", "M-10,-6L0,0L-10,6")
  .style("fill", "black");

const graphForm = document.getElementById("graphForm");
graphForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const nodesInput = document.getElementById("nodesInput").value;
  const edgesInput = document.getElementById("edgesInput").value;
  const startNodeInput = document.getElementById("startNodeInput").value;
  const endNodeInput = document.getElementById("endNodeInput").value;

  const nodes = nodesInput.split(",").map((node) => node.trim());
  const edges = edgesInput.split(",").map((edge) => edge.trim().split(" "));
  // console.log(nodes)
  // console.log(edges)

  if (validateInput(nodes, edges)) {
    const graph = {
      nodes: nodes,
      edges: edges,
    };
    console.log(graph);

    //Adjacency list maker
    const adjacencyList = {};

    edges.forEach(([source, target]) => {
      if (!adjacencyList[source]) {
        adjacencyList[source] = [];
      }
      if (!adjacencyList[target]) {
        adjacencyList[target] = [];
      }
      adjacencyList[source].push(target);
    });
    const adjList = document.getElementById("adjList");
    adjList.innerHTML = formatAdjacencyList(adjacencyList);

    console.log(adjacencyList);

    const circles = appendCircles(svg1, graph);

    const isTraversable = isPathExists(
      adjacencyList,
      startNodeInput,
      endNodeInput
    );
    console.log("Is traversable:", isTraversable);

    const returnValue = svg1.node();
    const container = document.getElementById("container");
    container.innerHTML = "";
    container.appendChild(returnValue);

    const resultContainer = document.getElementById("resultContainer");
    resultContainer.textContent = isTraversable
      ? "Path is traversable"
      : "Path is not traversable";
    // } else {
    //     alert('Invalid input. Edges can only be connected between existing nodes.');

    const path = findPath(adjacencyList, startNodeInput, endNodeInput);
    console.log('Path:', path);

    displayVisitedNodes();

  }
});

function formatAdjacencyList(adjacencyList) {
  let result = "<ul>";
  for (const [node, neighbors] of Object.entries(adjacencyList)) {
    result += `<li>${node}: `;
    if (neighbors.length === 0) {
      result += "No neighbors</li>";
    } else {
      result += `<ul><li>${neighbors.join("</li><li>")}</li></ul></li>`;
    }
  }
  result += "</ul>";
  return result;
}

// DFS search
function isPathExists(adjacencyList, startNode, endNode) {;
    const stack = [startNode];
  
    while (stack.length > 0) {
      const node = stack.pop();
      if (node === endNode) {
        return true;
      }
      visited.push(node); // Add the visited node to the visited array
      const neighbors = adjacencyList[node] || [];
      neighbors.forEach((neighbor) => {
        if (!visited.includes(neighbor)) {
          stack.push(neighbor);
        }
      });
    }
  
    return false;
  }

    // DFS search to find the path
    function findPath(adjacencyList, startNode, endNode) {
        const visited = new Set();
        const stack = [[startNode, []]];
  
        while (stack.length > 0) {
          const [node, path] = stack.pop();
          if (node === endNode) {
            return [...path, node];
          }
          visited.add(node);
          const neighbors = adjacencyList[node] || [];
          neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              stack.push([neighbor, [...path, node]]);
            }
          });
        }
  
        return null;
      }

function displayVisitedNodes() {
    const visitedNodesList = document.getElementById("visitedNodesList");
    visitedNodesList.innerText = "Visited Nodes:\n" + visited.join(", ");
}

function validateInput(nodes, edges) {
  const nodeSet = new Set(nodes);
  const invalidNodes = [];

  for (const [source, target] of edges) {
    if (!nodeSet.has(source) && !invalidNodes.includes(source)) {
      invalidNodes.push(source);
    }

    if (!nodeSet.has(target) && !invalidNodes.includes(target)) {
      invalidNodes.push(target);
    }
  }

  if (invalidNodes.length > 0) {
    const invalidNodesString = invalidNodes.join(", ");
    alert(
      `Invalid input. Nodes [${invalidNodesString}] in the edges do not exist.`
    );
    return false;
  }

  return true;
}
//ispathexistsbfs
// function isPathExists(adjacencyList, startNode, endNode) {
//     const queue = [startNode];
//     const visited = new Set();
//     const pathMap = {};
  
//     while (queue.length > 0) {
//       const node = queue.shift();
//       if (node === endNode) {
//         // Build the path from endNode to startNode
//         const path = [endNode];
//         let current = endNode;
//         while (current !== startNode) {
//           const prev = pathMap[current];
//           path.unshift(prev);
//           current = prev;
//         }
//         return {
//           exists: true,
//           path: path,
//         };
//       }
//       visited.add(node);
//       const neighbors = adjacencyList[node] || [];
//       for (const neighbor of neighbors) {
//         if (!visited.has(neighbor)) {
//           queue.push(neighbor);
//           // Store the path information
//           pathMap[neighbor] = node;
//         }
//       }
//     }
  
//     return {
//       exists: false,
//       path: [],
//     };
//   }