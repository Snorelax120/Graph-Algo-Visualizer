const svg1 = d3.create('svg').attr('viewBox', [0, 0, 3000, 1000]);

        

//solves the quadratic equations of the circle and the line(arrow) to check if they intersect or not
function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    const c = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;
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

function appendCircles(svg1, graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;
    const circleSpacing = 200;
    const circleRadius = 50;
    const circles = {};

    nodes.forEach((node, index) => {
        const cx = index * circleSpacing + circleRadius;
        const circle = svg1.append('circle')
            .attr('cx', cx)
            .attr('cy', '500')
            .attr('r', circleRadius)
            .attr('fill', 'green');
        circles[node] = circle;
        svg1.append('text')
            .attr('x', cx)
            .attr('y', '500')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(node)
            .attr('font-family', 'Arial')
            .attr('font-size', '40px')
            .attr('fill', 'black');
        });

edges.forEach(([source, target]) => {
const sourceCircle = circles[source];
const targetCircle = circles[target];
if (sourceCircle && targetCircle) {
let x1 = parseFloat(sourceCircle.attr('cx')) + circleRadius;
let y1 = parseFloat(sourceCircle.attr('cy'));
let x2 = parseFloat(targetCircle.attr('cx')) - circleRadius;
let y2 = parseFloat(targetCircle.attr('cy'));
let intersects = false;
nodes.forEach(node => {
    if (node !== source && node !== target) {
        const circle = circles[node];
        const cx = parseFloat(circle.attr('cx'));
        const cy = parseFloat(circle.attr('cy'));
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
    svg1.append('path')
        .attr('d', `M${x1},${y1} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${x2},${y2}`)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrowhead)');
} else {
    svg1.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrowhead)');
    }
 }
});

return circles;
}
//arrowhead marker
svg1.append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-10 -10 20 20')
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .append('path')
    .attr('d', 'M-10,-6L0,0L-10,6')
    .style('fill', 'black');

const graphForm = document.getElementById('graphForm');
graphForm.addEventListener('submit', function(event) {
event.preventDefault();
const nodesInput = document.getElementById('nodesInput').value;
const edgesInput = document.getElementById('edgesInput').value;
const startNodeInput = document.getElementById('startNodeInput').value;
const endNodeInput = document.getElementById('endNodeInput').value;


const nodes = nodesInput.split(',').map(node => node.trim());
const edges = edgesInput.split(',').map(edge => edge.trim().split(' '));
// console.log(nodes)
// console.log(edges)



if (validateInput(nodes, edges)) {
const graph = {
    nodes: nodes,
    edges: edges
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
const adjList = document.getElementById('adjList');
adjList.innerText = JSON.stringify(adjacencyList, null, 2);

console.log(adjacencyList);


const circles = appendCircles(svg1, graph);

const isTraversable = isPathExists(adjacencyList, startNodeInput, endNodeInput);
console.log('Is traversable:', isTraversable);

const returnValue = svg1.node();
const container = document.getElementById('container');
container.innerHTML = '';
container.appendChild(returnValue);

const resultContainer = document.getElementById('resultContainer');
resultContainer.textContent = isTraversable ? 'Path is traversable' : 'Path is not traversable';
// } else {
//     alert('Invalid input. Edges can only be connected between existing nodes.');
}
});

// DFS search
function isPathExists(adjacencyList, startNode, endNode) {
const visited = new Set();
const stack = [startNode];

while (stack.length > 0) {
    const node = stack.pop();
    if (node === endNode) {
        return true;
    }
    visited.add(node);
    const neighbors = adjacencyList[node] || [];
    neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
            stack.push(neighbor);
        }
     });
    }

    return false;
    console.log(visited)
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
    const invalidNodesString = invalidNodes.join(', ');
    alert(`Invalid input. Nodes [${invalidNodesString}] in the edges do not exist.`);
    return false;
}

return true;
}
