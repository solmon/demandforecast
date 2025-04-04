"use client"

import * as d3 from "d3"
import { useEffect, useRef } from "react"

interface StackOrderChartProps {
  data: Array<{ date: Date | string; [key: string]: any }>
  keys: string[]
  xKey: string
  xLabel: string
  yLabel: string
  height?: number
  formatX?: (value: any) => string
  formatY?: (value: number) => string
  parseDate?: (dateStr: string) => Date
  colors?: string[]
}

export function StackOrderChart({
  data,
  keys,
  xKey,
  xLabel,
  yLabel,
  height = 350,
  formatX = (d) => d.toString(),
  formatY = (d) => d.toString(),
  parseDate = (dateStr) => new Date(dateStr),
  colors = d3.schemeCategory10,
}: StackOrderChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)


  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Clear any existing chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 20, right: 80, bottom: 60, left: 60 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Process data to ensure dates are Date objects
    const processedData = data.map((d) => ({
      ...d,
      [xKey]: typeof d[xKey] === "string" ? parseDate(d[xKey] as string) : d[xKey],
    }))

    // Create the stack generator
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderDescending)

    // Generate the stacked data
    const stackedData = stack(processedData as any)

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d[xKey] as Date) as [Date, Date])
      .range([0, width])

    const maxValue = d3.max(stackedData, (series) => d3.max(series, (d) => d[1])) || 0
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([chartHeight, 0])

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(colors.slice(0, keys.length))

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => formatX(d)))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px")

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y).tickFormat((d) => formatY(d as number)))
      .selectAll("text")
      .style("font-size", "12px")

    // Create the area generator
    const area = d3.area<any>()
      .x((d) => x(d.data[xKey]))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX)

    // Add the areas
    svg
      .selectAll("mylayers")
      .data(stackedData)
      .join("path")
      .attr("fill", (d, i) => color(keys[i]) as string)
      .attr("opacity", 0.8)
      .attr("d", area)

    // Add X axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", chartHeight + margin.bottom - 10)
      .style("font-size", "14px")
      .text(xLabel)

    // Add Y axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-margin.left + 15},${chartHeight / 2})rotate(-90)`)
      .style("font-size", "14px")
      .text(yLabel)

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`)

    legend
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => color(d) as string)

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .text((d) => d)

    // Add tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "stack-tooltip")
      .style("position", "absolute")
      .style("background-color", "hsl(var(--background))")
      .style("border", "1px solid hsl(var(--border))")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")
      .style("z-index", 1000)

    // Create a transparent overlay for mouse events
    const overlay = svg
      .append("rect")
      .attr("width", width)
      .attr("height", chartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")

    // Add hover effects
    overlay.on("mousemove", function (event) {
      // Find the closest date to the mouse position
      const mouseX = d3.pointer(event)[0]
      const xDate = x.invert(mouseX)
      
      // Find the closest data point
      const bisect = d3.bisector((d: any) => d[xKey]).left
      const index = bisect(processedData, xDate, 1)
      const d0 = processedData[index - 1]
      const d1 = processedData[index] || d0
      const d = xDate.getTime() - (d0[xKey] as Date).getTime() > (d1[xKey] as Date).getTime() - xDate.getTime() ? d1 : d0
      
      if (!d) return

      // Show tooltip
      tooltip
        .style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`)
        .html(() => {
          let html = `<div><strong>${formatX(d[xKey])}</strong></div>`
          keys.forEach((key) => {
            html += `<div>${key}: ${formatY(d[key])}</div>`
          })
          return html
        })
        
      // Add vertical line at mouse position
      svg.selectAll(".mouse-line").remove()
      svg
        .append("line")
        .attr("class", "mouse-line")
        .attr("x1", x(d[xKey] as Date))
        .attr("x2", x(d[xKey] as Date))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "hsl(var(--foreground))")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
    })
    
    overlay.on("mouseleave", function () {
      tooltip.style("opacity", 0)
      svg.selectAll(".mouse-line").remove()
    })

    // Handle resize
    const handleResize = () => {
      if (!svgRef.current) return
      
      // Remove tooltip
      d3.select("body").select(".stack-tooltip").remove()
      
      // Redraw chart
      d3.select(svgRef.current).selectAll("*").remove()
      // We rely on React re-rendering
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      d3.select("body").select(".stack-tooltip").remove()
    }
  }, [data, keys, xKey, xLabel, yLabel, height, formatX, formatY, parseDate, colors])

  return <svg ref={svgRef} className="w-full" style={{ height }} />
}

