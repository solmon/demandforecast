'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface LineChartProps {
  data: Array<{ date: Date | string; value: number }>;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  color?: string;
  height?: number;
  formatX?: (value: any) => string;
  formatY?: (value: number) => string;
  parseDate?: (dateStr: string) => Date;
}

export function LineChart({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  color = 'hsl(var(--primary))',
  height = 300,
  formatX = (d) => d.toString(),
  formatY = (d) => d.toString(),
  parseDate = (dateStr) => new Date(dateStr),
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data to ensure dates are Date objects
    const processedData = data.map((d) => ({
      ...d,
      [xKey]:
        typeof d[xKey as keyof typeof d] === 'string'
          ? parseDate(d[xKey as keyof typeof d] as string)
          : d[xKey as keyof typeof d],
    }));

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d[xKey as keyof typeof d] as Date) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d[yKey as keyof typeof d] as number) * 1.1 || 0])
      .nice()
      .range([chartHeight, 0]);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => formatX(d)),
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y).tickFormat((d) => formatY(d as number)))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X axis label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 3)
      .attr('y', chartHeight + margin.bottom - 10)
      .style('font-size', '14px')
      .text(xLabel);

    // Add Y axis label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-margin.left + 15},${chartHeight / 2})rotate(-90)`)
      .style('font-size', '14px')
      .text(yLabel);

    // Add the line
    const line = d3
      .line<any>()
      .x((d) => x(d[xKey]))
      .y((d) => y(d[yKey]))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg
      .selectAll('dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d[xKey as keyof typeof d] as Date))
      .attr('cy', (d) => y(d[yKey as keyof typeof d] as number))
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'hsl(var(--background))')
      .style('border', '1px solid hsl(var(--border))')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.2s')
      .style('z-index', 1000);

    // Add hover effects
    svg
      .selectAll('circle')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 6).attr('stroke-width', 2);

        tooltip
          .style('opacity', 1)
          .html(`${formatX(d[xKey as keyof typeof d])}: ${formatY(d[yKey as keyof typeof d] as number)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4).attr('stroke-width', 1);

        tooltip.style('opacity', 0);
      });

    // Handle resize
    const handleResize = () => {
      if (!svgRef.current) return;

      // Remove tooltip
      d3.select('body').select('.tooltip').remove();

      // Redraw chart
      d3.select(svgRef.current).selectAll('*').remove();
      // We would re-render the chart here, but for simplicity we'll just rely on React re-rendering
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      d3.select('body').select('.tooltip').remove();
    };
  }, [data, xKey, yKey, xLabel, yLabel, color, height, formatX, formatY, parseDate]);

  return <svg ref={svgRef} className="w-full" style={{ height }} />;
}
