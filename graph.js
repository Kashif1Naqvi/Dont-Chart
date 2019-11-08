const dim =  { width:500 , height: 340, radius:150 }
const cent = {x:dim.width/2 + 5 ,  y:dim.height/2 + 5 }
const svg = d3.select(".canvas").append("svg").attr("height",dim.height+150).attr("width",dim.width+150)
const graph = svg.append("g").attr("transform",`translate(${cent.x},${cent.y})`)
const color = d3.scaleOrdinal(d3['schemeSet3'])
const pie = d3.pie().sort(null).value(d=>d.cost)
const arcPath = d3.arc().outerRadius(dim.radius).innerRadius(dim.radius/2)
const legendGroup = svg.append("g").attr("transform",`translate(${cent.x + 190},${cent.y-101})`)
const legend = d3.legendColor()
                 .shape("circle")
                 .shapePadding(10)
                 .scale(color);
const tip = d3.tip()
             .attr("class","tip card")
             .html(d=>{
               let content = `<div class="name" >${d.data.name}</div>`
               content += `<div class="cost">${d.data.cost}</div>`
               content += `<div class="text-info">Click slice to delete</div>`
               return content;
             })

graph.call(tip)
var data = []
const update = (data) => {
  color.domain(data.map(d => d.name))

  legendGroup.call(legend).style("fill","#fff").style("font-weight","bold")

  const path = graph.selectAll("path").data(pie(data))
               path.exit().transition().duration(750).attrTween("d",arcTweenExit)
               .remove()
       path.attr("d",arcPath)
       .enter()
       .append("path")
       .attr("stroke","#fff")
       .attr("stroke-width",1)
       .attr("fill", d => color(d.data.name))

      graph.selectAll("path")
      .on("mouseover",(d,i,n)=>{
          tip.show(d,n[i])
          handleMouseOver(d,i,n)
       })
       .on("mouseout",(d,i,n)=>{
           tip.hide()
           handleMouseOut(d,i,n)
        })
       .on("click",handleClick)
       .transition()
         .duration(750)
         .attrTween("d",arcTweenEnter)
}
db.collection("expenses").onSnapshot(res=>{

  res.docChanges().map(change=>{
    let doc = {...change.doc.data(), id: change.doc.id}
    switch (change.type) {
      case 'added':
        data.push(doc)
        break;
      case 'modified':
        let index = data.findIndex(item =>  item.id == doc.id );
        data[index] = doc;
        break;
      case "removed":
          data = data.filter(item => item.id !== doc.id)
        break;
      default:
        break;
    }
  })
  update(data)
})

const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle , d.startAngle);
  return function(t){
    d.startAngle = i(t)
    return arcPath(d)
  }
}

const arcTweenExit  = (d) => {
  let i = d3.interpolate(d.startAngle , d.endAngle);
  return function(t){
    d.startAngle = i(t)
    return arcPath(d)
  }
}

const handleMouseOver = (d,i,n)=>{
    d3.select(n[i]).transition("changeSliceFill").duration(400).attr("fill","white")
}

const handleMouseOut = (d,i,n)=>{
    d3.select(n[i]).transition("changeSliceFill").duration(400).attr("fill",color(d.data.name))
}

const handleClick = (d) =>{
  console.log(d.data.id);
  let id = d.data.id
  db.collection("expenses").doc(id).delete()
}
