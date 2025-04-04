"use client"

import * as d3 from "d3"
import { useEffect, useRef } from "react"

interface PieChartProps {
  data: Array<{ name: string; value: number }>
  nameKey: string
  valueKey: string
  height?: number
  colors?: string[]
  formatValue?: (value: number) => string
  onSliceClick?: (item: any) => void
}

export function PieChart({
  data,
  nameKey,
  valueKey,
  height = 300,
  colors = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.2)",
  ],
  formatValue = (d) => d.toString(),
  onSliceClick,
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Setup dimensions
    const width = svgRef.current.clientWidth
    const chartHeight = height
    const radius = Math.min(width, chartHeight) / 2 - 40 // Increased margin for labels
    
    // Create total for percentage calculations
    const totalValue = d3.sum(data, d => d[valueKey])
    
    // Sort data to put smaller slices adjacent to larger ones
    const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey])

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${width / 2},${chartHeight / 2})`)

    // Color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(sortedData.map((d) => d[nameKey as keyof typeof d] as string))
      .range(
        sortedData.length > colors.length
          ? d3.quantize(d3.interpolateHsl(colors[0], colors[colors.length - 1]), sortedData.length)
          : colors,
      )

    // Create pie layout
    const pie = d3
      .pie<any>()
      .value((d) => d[valueKey])
      .sort(null) // Keep original order
      .padAngle(0.03) // Increased padding

    // Arc generators
    const arc = d3
      .arc<d3.PieArcDatum<any>>()
      .innerRadius(0)
      .outerRadius(radius)
      .cornerRadius(4)

    // Create arcs
    const pieData = pie(sortedData)
    const arcs = svg.selectAll(".arc")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "arc")

    // Draw pie slices
    arcs
      .append("path")
      .attr("d", (d) => arc(d))
      .attr("fill", (d) => colorScale(d.data[nameKey]))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this)
          .style("opacity", 1)
          .attr("stroke", "hsl(var(--background))")
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)")
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("opacity", 0.8)
          .attr("stroke", "white")
          .transition()
          .duration(200)
          .attr("transform", "scale(1)")
      })
      .on("click", (event, d) => {
        if (onSliceClick) {
          onSliceClick(d.data)
        }
      })
      .transition()
      .duration(800)
      .attrTween("d", (d) => {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return (t) => arc(d)
      })

    // Add tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "hsl(var(--background))")
      .style("border", "1px solid hsl(var(--border))")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")
      .style("z-index", 1000)

    arcs
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <div>
              <strong>${d.data[nameKey]}</strong><br/>
              ${formatValue(d.data[valueKey])}
            </div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0)
      })
    
    const slicesToLabel = pieData.filter(d => (d.data[valueKey] / totalValue) >= 0.03)
    
    slicesToLabel.forEach((d) => {
      const percentage = (d.data[valueKey] / totalValue) * 100
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
      
      let labelX, labelY, anchor
      
      if (percentage >= 10) {
        const labelRadius = radius * 0.7
        labelX = labelRadius * Math.sin(midAngle)
        labelY = -labelRadius * Math.cos(midAngle)
        anchor = "middle"
      } else {
        const labelRadius = radius * 1.2
        labelX = labelRadius * Math.sin(midAngle)
        labelY = -labelRadius * Math.cos(midAngle)
        anchor = midAngle > Math.PI ? "end" : "start"
        
        // Add connecting line
        const startPoint = arc.centroid(d)
        const endPoint = [labelX, labelY]
        
        svg.append("line")
          .attr("x1", startPoint[0])
          .attr("y1", startPoint[1])
          .attr("x2", endPoint[0])
          .attr("y2", endPoint[1])
          .attr("stroke", "hsl(var(--muted-foreground))")
          .attr("stroke-width", 1)
          .style("opacity", 0)
          .transition()
          .delay(800)
          .duration(500)
          .style("opacity", 1)
      }
      
      const text = svg.append("text")
        .attr("transform", `translate(${labelX}, ${labelY})`)
        .attr("text-anchor", anchor)
        .style("font-size", "12px")
        .style("fill", "grey")
        .style("opacity", 0);
      
      // Add name
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "0em")
        .text(d.data[nameKey]);
      
      // Add value
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .text(formatValue(d.data[valueKey]))
        .style("font-weight", "bold");
      
      // Apply transition
      text.transition()
        .delay(800)
        .duration(500)
        .style("opacity", 1);
    })
    
    const smallSlices = pieData.filter(d => (d.data[valueKey] / totalValue) < 0.03)
    
    if (smallSlices.length > 0) {
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius * 1.2}, ${-radius})`)
      
      smallSlices.forEach((d, i) => {
        // Create the legend group first
        const legendGroup = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`)
          .style("opacity", 0);
        
        // Add rectangle to the group
        legendGroup.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", colorScale(d.data[nameKey]));
        
        // Add text to the group
        legendGroup.append("text")
          .attr("x", 15)
          .attr("y", 8)
          .style("font-size", "10px")
          .text(`${d.data[nameKey]}: ${formatValue(d.data[valueKey])}`);
        
        // Apply transition separately
        legendGroup.transition()
          .delay(800 + i * 50)
          .duration(500)
          .style("opacity", 1);
      })
    }

    // Clean up on unmount
    const handleResize = () => {
      if (!svgRef.current) return
      d3.select("body").select(".tooltip").remove()
      d3.select(svgRef.current).selectAll("*").remove()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      d3.select("body").select(".tooltip").remove()
    }
    
  }, [data, nameKey, valueKey, height, colors, formatValue, onSliceClick])

  return <svg ref={svgRef} className="w-full" style={{ height }} />
}

