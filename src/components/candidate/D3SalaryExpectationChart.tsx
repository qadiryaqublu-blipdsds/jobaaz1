import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Vacancy, ExperienceSalaryBreakdown } from '../../types';
import { 
  Target, 
  Sparkles, 
  HelpCircle, 
  Building2, 
  ChevronRight, 
  Sliders, 
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  Layers,
  BarChart2,
  MousePointer,
  ArrowUpDown,
  CheckCircle2,
  Info
} from 'lucide-react';

interface D3SalaryExpectationChartProps {
  roleName: string;
  category: string;
  minSalary: number; // in AZN
  avgSalary: number; // in AZN
  maxSalary: number; // in AZN
  experienceBreakdown: ExperienceSalaryBreakdown[];
  matchingVacancies: Vacancy[];
  userExpectationAZN: number;
  onUpdateUserExpectation: (newVal: number) => void;
  currency: 'AZN' | 'USD';
  rate: number;
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

type D3ViewMode = 'distribution' | 'experience_box' | 'vacancy_cluster';

export const D3SalaryExpectationChart: React.FC<D3SalaryExpectationChartProps> = ({
  roleName,
  category,
  minSalary,
  avgSalary,
  maxSalary,
  experienceBreakdown,
  matchingVacancies,
  userExpectationAZN,
  onUpdateUserExpectation,
  currency,
  rate,
  onSelectVacancy,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<D3ViewMode>('distribution');
  const [hoveredVacancy, setHoveredVacancy] = useState<Vacancy | null>(null);
  const [hoveredSalaryLive, setHoveredSalaryLive] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const currencySymbol = currency === 'USD' ? '$' : '₼';
  const formatMoney = (valAZN: number) => {
    const scaled = Math.round(valAZN * rate);
    return `${scaled.toLocaleString()} ${currencySymbol}`;
  };

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Compute key statistical parameters and percentiles for this position
  const stats = useMemo(() => {
    const p10 = Math.round(minSalary + (avgSalary - minSalary) * 0.25);
    const p25 = Math.round(minSalary + (avgSalary - minSalary) * 0.55);
    const p50 = Math.round(avgSalary);
    const p75 = Math.round(avgSalary + (maxSalary - avgSalary) * 0.45);
    const p90 = Math.round(avgSalary + (maxSalary - avgSalary) * 0.82);

    // Calculate user percentile within this distribution
    let percentile = 50;
    if (userExpectationAZN <= minSalary) {
      percentile = Math.max(2, Math.round((userExpectationAZN / minSalary) * 10));
    } else if (userExpectationAZN <= p25) {
      percentile = Math.round(10 + ((userExpectationAZN - p10) / Math.max(1, p25 - p10)) * 15);
    } else if (userExpectationAZN <= p50) {
      percentile = Math.round(25 + ((userExpectationAZN - p25) / Math.max(1, p50 - p25)) * 25);
    } else if (userExpectationAZN <= p75) {
      percentile = Math.round(50 + ((userExpectationAZN - p50) / Math.max(1, p75 - p50)) * 25);
    } else if (userExpectationAZN <= p90) {
      percentile = Math.round(75 + ((userExpectationAZN - p75) / Math.max(1, p90 - p75)) * 15);
    } else {
      percentile = Math.min(99, Math.round(90 + ((userExpectationAZN - p90) / Math.max(1, maxSalary * 1.3 - p90)) * 9));
    }
    percentile = Math.max(1, Math.min(99, percentile));

    // Matching live vacancies paying at least user expectation
    const vacanciesWithSalary = matchingVacancies.filter(v => !v.hideSalary && (v.minSalary || v.maxSalary));
    const meetingVacancies = vacanciesWithSalary.filter(v => (v.maxSalary || v.minSalary || 0) >= userExpectationAZN);
    const meetingPct = vacanciesWithSalary.length > 0 
      ? Math.round((meetingVacancies.length / vacanciesWithSalary.length) * 100)
      : Math.max(5, 100 - percentile);

    // Difference from market median
    const diffAZN = userExpectationAZN - p50;
    const diffPct = Math.round((diffAZN / p50) * 100);

    // Diagnostic Tier
    let tierText = 'Bazarın Nüvəsi (Optimal)';
    let tierDesc = 'İşəgötürənlərin ən çox təklif etdiyi büdcə aralığıdır. Rəqabət və təklif alma şansı maksimaldır.';
    let tierColor = 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentile < 25) {
      tierText = 'İlkin / Başlanğıc Səviyyə';
      tierDesc = 'Gözləntiniz bazar minimumuna yaxındır. Şirkətlər dərhal maraqlana bilər, lakin dəyərinizdən aşağı qəbul etməməyə diqqət yetirin.';
      tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (percentile > 75 && percentile <= 90) {
      tierText = 'Senior & Aparıcı Mütəxəssis';
      tierDesc = 'Bazarda ən güclü namizədlər sırasındasınız. Müsahibələrdə praktiki layihələriniz və komanda təcrübəniz həlledicidir.';
      tierColor = 'text-purple-700 bg-purple-50 border-purple-200';
    } else if (percentile > 90) {
      tierText = 'Ekspert / Qlobal Remote Tələbat';
      tierDesc = 'Yerli bazar tavanından yüksəkdir. Əsasən beynəlxalq autsorsinq, xarici layihələr və rəhbər vəzifələr üçün xarakterikdir.';
      tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }

    return {
      p10,
      p25,
      p50,
      p75,
      p90,
      percentile,
      vacanciesWithSalary,
      meetingVacancies,
      meetingPct,
      diffAZN,
      diffPct,
      tierText,
      tierDesc,
      tierColor
    };
  }, [minSalary, avgSalary, maxSalary, userExpectationAZN, matchingVacancies]);

  // Main D3 Rendering effect with rich crosshair tracking and range tooltips
  useEffect(() => {
    if (!svgRef.current) return;

    const width = Math.max(320, containerWidth);
    const height = viewMode === 'experience_box' ? 360 : 340;
    const margin = { top: 40, right: 35, bottom: 55, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    // Global gradient definitions
    const defs = svg.append('defs');

    // Market density area gradient
    const densityGradient = defs.append('linearGradient')
      .attr('id', 'd3-density-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    densityGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.55);
    densityGradient.append('stop').attr('offset', '80%').attr('stop-color', '#60a5fa').attr('stop-opacity', 0.15);
    densityGradient.append('stop').attr('offset', '100%').attr('stop-color', '#93c5fd').attr('stop-opacity', 0.0);

    // Expectation highlight gradient
    const expectationGradient = defs.append('linearGradient')
      .attr('id', 'd3-expectation-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    expectationGradient.append('stop').attr('offset', '0%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 0.75);
    expectationGradient.append('stop').attr('offset', '100%').attr('stop-color', '#c084fc').attr('stop-opacity', 0.05);

    // Glow filter for user marker
    const filter = defs.append('filter')
      .attr('id', 'd3-glow')
      .attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Domain bounds for salary axis (AZN)
    const domainMin = Math.max(300, Math.round(minSalary * 0.7));
    const domainMax = Math.round(Math.max(maxSalary * 1.25, userExpectationAZN * 1.15));

    // X Scale (Salary in AZN)
    const xScale = d3.scaleLinear()
      .domain([domainMin, domainMax])
      .range([0, innerWidth])
      .nice();

    // Background grid lines (vertical)
    const xGrid = d3.axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 90)))
      .tickSize(-innerHeight)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xGrid)
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3,3');

    g.select('.grid .domain').remove();

    // Normal distribution helpers for KDE curve
    const mean = avgSalary;
    const sigma = Math.max(200, (maxSalary - minSalary) / 3.4);
    const getDensityY = (xVal: number) => {
      const z = (xVal - mean) / sigma;
      const skewWeight = xVal < mean ? 1.05 : 0.95;
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(z * skewWeight, 2));
    };

    let yScale: d3.ScaleLinear<number, number> | null = null;

    // -------------------------------------------------------------
    // MODE 1: D3 MARKET DENSITY & PERCENTILE ZONES
    // -------------------------------------------------------------
    if (viewMode === 'distribution') {
      // Generate points along the X axis
      const sampleCount = 100;
      const step = (domainMax - domainMin) / sampleCount;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i <= sampleCount; i++) {
        const xVal = domainMin + i * step;
        points.push({ x: xVal, y: getDensityY(xVal) });
      }

      const maxY = d3.max(points, d => d.y) || 0.001;
      yScale = d3.scaleLinear()
        .domain([0, maxY * 1.12])
        .range([innerHeight, 0]);

      // Draw Percentile shaded backgrounds
      // P25 to P75 (Core IQR band)
      const xP25 = xScale(stats.p25);
      const xP75 = xScale(stats.p75);
      
      const coreBand = g.append('rect')
        .attr('x', xP25)
        .attr('y', 0)
        .attr('width', Math.max(0, xP75 - xP25))
        .attr('height', innerHeight)
        .attr('fill', '#eff6ff')
        .attr('opacity', 0.85)
        .attr('cursor', 'pointer');

      // Label for Core Market Zone
      g.append('text')
        .attr('x', (xP25 + xP75) / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', '#3b82f6')
        .text('Bazarın Nüvəsi (P25 - P75)');

      // Area generator
      const areaGen = d3.area<{ x: number; y: number }>()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => (yScale ? yScale(d.y) : innerHeight))
        .curve(d3.curveMonotoneX);

      // Line generator
      const lineGen = d3.line<{ x: number; y: number }>()
        .x(d => xScale(d.x))
        .y(d => (yScale ? yScale(d.y) : 0))
        .curve(d3.curveMonotoneX);

      // Render distribution area
      g.append('path')
        .datum(points)
        .attr('fill', 'url(#d3-density-gradient)')
        .attr('d', areaGen);

      // Render distribution line stroke
      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', '#2563eb')
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);

      // Shaded area under user expectation
      const userPoints = points.filter(p => p.x <= userExpectationAZN);
      if (userPoints.length > 0) {
        const yUser = getDensityY(userExpectationAZN);
        const userPoly = [...userPoints, { x: userExpectationAZN, y: yUser }];
        
        g.append('path')
          .datum(userPoly)
          .attr('fill', 'url(#d3-expectation-gradient)')
          .attr('opacity', 0.6)
          .attr('d', areaGen);
      }

      // Benchmark vertical dashed lines: Min, P25, Median (P50), P75, Max, P90
      const benchmarks = [
        { label: 'Min', val: minSalary, color: '#f59e0b', desc: 'Bazar Minimumu' },
        { label: 'P25', val: stats.p25, color: '#94a3b8', desc: 'Aşağı Kvartil' },
        { label: 'Median (P50)', val: stats.p50, color: '#2563eb', desc: 'Orta Bazar Maaşı' },
        { label: 'P75', val: stats.p75, color: '#94a3b8', desc: 'Yuxarı Kvartil' },
        { label: 'Maks', val: maxSalary, color: '#10b981', desc: 'Bazar Maksimumu' },
      ];

      benchmarks.forEach(bm => {
        const xPos = xScale(bm.val);
        if (xPos >= 0 && xPos <= innerWidth) {
          const isCore = bm.label.includes('Median') || bm.label === 'Min' || bm.label === 'Maks';
          
          g.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', 20)
            .attr('y2', innerHeight)
            .attr('stroke', bm.color)
            .attr('stroke-width', isCore ? 1.8 : 1)
            .attr('stroke-dasharray', isCore ? '4,3' : '3,3');

          g.append('text')
            .attr('x', xPos)
            .attr('y', innerHeight - 6)
            .attr('text-anchor', 'middle')
            .attr('font-size', '9.5px')
            .attr('font-weight', 'bold')
            .attr('fill', bm.color)
            .text(bm.label);
        }
      });

      // Scatter Dots of Real Matching Vacancies on Platform
      const realVacanciesWithSalary = matchingVacancies
        .filter(v => !v.hideSalary && (v.minSalary || v.maxSalary))
        .map((v, idx) => {
          const mid = v.minSalary && v.maxSalary ? (v.minSalary + v.maxSalary) / 2 : (v.minSalary || v.maxSalary || 0);
          return {
            vacancy: v,
            salary: mid,
            // Jitter for visual clarity
            jitterY: innerHeight - 20 - ((idx % 4) * 12)
          };
        });

      if (realVacanciesWithSalary.length > 0) {
        const dotsGroup = g.append('g').attr('class', 'vacancy-dots');

        realVacanciesWithSalary.forEach(d => {
          const xPos = xScale(d.salary);
          if (xPos < 0 || xPos > innerWidth) return;

          const isAbove = d.salary >= userExpectationAZN;
          const circle = dotsGroup.append('circle')
            .attr('cx', xPos)
            .attr('cy', d.jitterY)
            .attr('r', 5.5)
            .attr('fill', isAbove ? '#10b981' : '#3b82f6')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .attr('cursor', 'pointer')
            .style('transition', 'transform 0.15s ease');

          circle.on('mouseenter', (event) => {
            circle.attr('r', 8.5).attr('stroke', '#1e293b').attr('stroke-width', 2);
            setHoveredVacancy(d.vacancy);
            if (tooltipRef.current) {
              tooltipRef.current.style.opacity = '1';
              const leftPos = Math.min(window.innerWidth - 300, Math.max(16, event.pageX + 12));
              tooltipRef.current.style.left = `${leftPos}px`;
              tooltipRef.current.style.top = `${event.pageY - 110}px`;
              tooltipRef.current.innerHTML = `
                <div class="space-y-1.5 min-w-[210px]">
                  <div class="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Canlı Vakansiya</span>
                    <span class="text-[10px] px-1.5 py-0.2 bg-green-900/60 text-green-300 font-bold rounded">Portal Elanı</span>
                  </div>
                  <div class="font-bold text-slate-100 text-xs">${d.vacancy.title}</div>
                  <div class="text-[11px] text-slate-300">${d.vacancy.companyName} • ${d.vacancy.city}</div>
                  <div class="text-xs font-bold text-green-400">Təklif: ${formatMoney(d.salary)}</div>
                  <div class="border-t border-slate-800 pt-1 text-[10px] space-y-0.5 text-slate-300">
                    <div>Bazar Aralığı: <strong class="text-blue-300">${formatMoney(minSalary)} — ${formatMoney(maxSalary)}</strong></div>
                    <div>Sizin Gözlənti: <strong class="text-purple-300">${formatMoney(userExpectationAZN)}</strong></div>
                  </div>
                  <div class="text-[9.5px] text-blue-300 italic pt-0.5">Vakansiyanı açmaq üçün klikləyin</div>
                </div>
              `;
            }
          });

          circle.on('mouseleave', () => {
            circle.attr('r', 5.5).attr('stroke', '#ffffff').attr('stroke-width', 1.5);
            setHoveredVacancy(null);
            if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
          });

          circle.on('click', () => {
            if (onSelectVacancy) onSelectVacancy(d.vacancy);
          });
        });
      }
    }

    // -------------------------------------------------------------
    // MODE 2: D3 EXPERIENCE LEVEL BOX & WHISKER TIERS
    // -------------------------------------------------------------
    if (viewMode === 'experience_box') {
      const tiers = experienceBreakdown.length > 0 ? experienceBreakdown : [
        { level: 'Junior (0-1 il)', minSalary: minSalary, avgSalary: Math.round(minSalary * 1.3), maxSalary: Math.round(avgSalary * 0.9), sampleSize: 12 },
        { level: 'Mid-level (1-3 il)', minSalary: Math.round(minSalary * 1.2), avgSalary: avgSalary, maxSalary: Math.round(avgSalary * 1.25), sampleSize: 24 },
        { level: 'Senior (3-5+ il)', minSalary: Math.round(avgSalary * 1.1), avgSalary: Math.round(avgSalary * 1.45), maxSalary: maxSalary, sampleSize: 18 },
        { level: 'Lead / Rəhbər (5+ il)', minSalary: Math.round(avgSalary * 1.4), avgSalary: Math.round(maxSalary * 1.2), maxSalary: Math.round(maxSalary * 1.5), sampleSize: 8 },
      ];

      const yScaleExp = d3.scaleBand()
        .domain(tiers.map(t => t.level))
        .range([20, innerHeight - 10])
        .padding(0.4);

      // Draw rows
      tiers.forEach((tier, idx) => {
        const yPos = yScaleExp(tier.level) || 0;
        const barHeight = yScaleExp.bandwidth();
        const centerY = yPos + barHeight / 2;

        const xMin = xScale(tier.minSalary);
        const xAvg = xScale(tier.avgSalary);
        const xMax = xScale(tier.maxSalary);

        // Row background highlight on hover or expectation match
        const matchesExpectation = userExpectationAZN >= tier.minSalary && userExpectationAZN <= tier.maxSalary;

        const rowRect = g.append('rect')
          .attr('x', 0)
          .attr('y', yPos - 4)
          .attr('width', innerWidth)
          .attr('height', barHeight + 8)
          .attr('rx', 6)
          .attr('fill', matchesExpectation ? '#f5f3ff' : idx % 2 === 0 ? '#f8fafc' : '#ffffff')
          .attr('stroke', matchesExpectation ? '#c084fc' : '#f1f5f9')
          .attr('stroke-width', matchesExpectation ? 1.5 : 1)
          .attr('cursor', 'pointer');

        rowRect.on('mouseenter', (event) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '1';
            const leftPos = Math.min(window.innerWidth - 300, Math.max(16, event.pageX + 12));
            tooltipRef.current.style.left = `${leftPos}px`;
            tooltipRef.current.style.top = `${event.pageY - 110}px`;
            tooltipRef.current.innerHTML = `
              <div class="space-y-1.5 min-w-[210px]">
                <div class="font-bold text-slate-100 text-xs">${roleName} • ${tier.level}</div>
                <div class="text-[11px] text-blue-300">Bu Təcrübə Diapazonu: <strong>${formatMoney(tier.minSalary)} — ${formatMoney(tier.maxSalary)}</strong></div>
                <div class="text-[11px] text-slate-200">Orta Maaş: <strong>${formatMoney(tier.avgSalary)}</strong></div>
                <div class="border-t border-slate-800 pt-1 text-[10px] space-y-0.5 text-slate-300">
                  <div>Ümumi Bazar Aralığı: <strong class="text-amber-300">${formatMoney(minSalary)} — ${formatMoney(maxSalary)}</strong></div>
                  <div>Sizin Gözlənti: <strong class="text-purple-300">${formatMoney(userExpectationAZN)}</strong></div>
                </div>
              </div>
            `;
          }
        });

        rowRect.on('mouseleave', () => {
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        });

        // Tier Title
        g.append('text')
          .attr('x', 8)
          .attr('y', yPos - 6)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('fill', matchesExpectation ? '#7c3aed' : '#334155')
          .text(tier.level);

        // Whisker line (min to max)
        g.append('line')
          .attr('x1', xMin)
          .attr('x2', xMax)
          .attr('y1', centerY)
          .attr('y2', centerY)
          .attr('stroke', '#64748b')
          .attr('stroke-width', 2);

        // Left whisker cap (min)
        g.append('line')
          .attr('x1', xMin).attr('x2', xMin)
          .attr('y1', centerY - 6).attr('y2', centerY + 6)
          .attr('stroke', '#64748b').attr('stroke-width', 2);

        // Right whisker cap (max)
        g.append('line')
          .attr('x1', xMax).attr('x2', xMax)
          .attr('y1', centerY - 6).attr('y2', centerY + 6)
          .attr('stroke', '#64748b').attr('stroke-width', 2);

        // IQR Box (around average)
        const iqrWidth = Math.max(16, (xMax - xMin) * 0.48);
        const iqrLeft = Math.max(xMin, xAvg - iqrWidth / 2);

        g.append('rect')
          .attr('x', iqrLeft)
          .attr('y', centerY - barHeight / 2.5)
          .attr('width', iqrWidth)
          .attr('height', barHeight / 1.25)
          .attr('rx', 4)
          .attr('fill', matchesExpectation ? '#a855f7' : '#3b82f6')
          .attr('opacity', 0.85);

        // Average Diamond marker
        const diamondSymbol = d3.symbol().type(d3.symbolDiamond).size(70);
        g.append('path')
          .attr('d', diamondSymbol)
          .attr('transform', `translate(${xAvg}, ${centerY})`)
          .attr('fill', '#ffffff')
          .attr('stroke', matchesExpectation ? '#6b21a8' : '#1e3a8a')
          .attr('stroke-width', 2);

        // Min & Max text tags
        g.append('text')
          .attr('x', xMin)
          .attr('y', centerY + 16)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', '#64748b')
          .text(formatMoney(tier.minSalary));

        g.append('text')
          .attr('x', xMax)
          .attr('y', centerY + 16)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', '#64748b')
          .text(formatMoney(tier.maxSalary));

        // Average center text
        g.append('text')
          .attr('x', xAvg)
          .attr('y', centerY - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', matchesExpectation ? '#581c87' : '#1e40af')
          .text(formatMoney(tier.avgSalary));
      });
    }

    // -------------------------------------------------------------
    // MODE 3: REAL VACANCY CLUSTER / SCATTER
    // -------------------------------------------------------------
    if (viewMode === 'vacancy_cluster') {
      const vacanciesList = matchingVacancies
        .filter(v => !v.hideSalary && (v.minSalary || v.maxSalary))
        .map((v, i) => {
          const mid = v.minSalary && v.maxSalary ? (v.minSalary + v.maxSalary) / 2 : (v.minSalary || v.maxSalary || 0);
          return {
            ...v,
            mid,
            rowIndex: i % 5,
          };
        });

      const trackHeight = innerHeight / 5;

      for (let i = 0; i < 5; i++) {
        g.append('line')
          .attr('x1', 0).attr('x2', innerWidth)
          .attr('y1', (i + 0.5) * trackHeight)
          .attr('y2', (i + 0.5) * trackHeight)
          .attr('stroke', '#f8fafc')
          .attr('stroke-dasharray', '2,2');
      }

      if (vacanciesList.length === 0) {
        g.append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#94a3b8')
          .text('Bu vəzifə üçün canlı elanların maaş qeydləri toplanır.');
      } else {
        vacanciesList.forEach((vac) => {
          const xPos = xScale(vac.mid);
          if (xPos < 0 || xPos > innerWidth) return;
          const yPos = (vac.rowIndex + 0.5) * trackHeight;
          const isAbove = vac.mid >= userExpectationAZN;

          const group = g.append('g')
            .attr('transform', `translate(${xPos}, ${yPos})`)
            .attr('cursor', 'pointer');

          group.append('circle')
            .attr('r', 12)
            .attr('fill', isAbove ? '#10b981' : '#3b82f6')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.9);

          group.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .attr('fill', '#ffffff')
            .text(vac.companyName.charAt(0).toUpperCase());

          group.on('mouseenter', (event) => {
            setHoveredVacancy(vac);
            if (tooltipRef.current) {
              tooltipRef.current.style.opacity = '1';
              const leftPos = Math.min(window.innerWidth - 300, Math.max(16, event.pageX + 12));
              tooltipRef.current.style.left = `${leftPos}px`;
              tooltipRef.current.style.top = `${event.pageY - 110}px`;
              tooltipRef.current.innerHTML = `
                <div class="space-y-1.5 min-w-[210px]">
                  <div class="font-bold text-slate-100 text-xs">${vac.title}</div>
                  <div class="text-[11px] text-slate-300">${vac.companyName} • ${vac.city}</div>
                  <div class="text-xs font-bold text-green-400 mt-0.5">Təklif: ${formatMoney(vac.mid)}</div>
                  <div class="border-t border-slate-800 pt-1 text-[10px] space-y-0.5 text-slate-300">
                    <div>Bazar Aralığı: <strong class="text-blue-300">${formatMoney(minSalary)} — ${formatMoney(maxSalary)}</strong></div>
                    <div>Sizin Gözlənti: <strong class="text-purple-300">${formatMoney(userExpectationAZN)}</strong></div>
                  </div>
                </div>
              `;
            }
          });

          group.on('mouseleave', () => {
            setHoveredVacancy(null);
            if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
          });

          group.on('click', () => {
            if (onSelectVacancy) onSelectVacancy(vac);
          });
        });
      }
    }

    // -------------------------------------------------------------
    // BOTTOM X-AXIS RENDER (All Modes)
    // -------------------------------------------------------------
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 90)))
      .tickFormat((d) => formatMoney(Number(d)));

    const xAxisG = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#cbd5e1');
    xAxisG.selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#475569')
      .attr('font-weight', '500')
      .attr('dy', '1em');

    // -------------------------------------------------------------
    // DYNAMIC MOUSE HOVER CROSSHAIR & FULL RANGE TOOLTIP OVERLAY
    // -------------------------------------------------------------
    const crosshairGroup = g.append('g')
      .attr('class', 'crosshair-tracking-group')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const crosshairLine = crosshairGroup.append('line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 10).attr('y2', innerHeight)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '3,3');

    const crosshairCircle = crosshairGroup.append('circle')
      .attr('cx', 0).attr('cy', 0)
      .attr('r', 5.5)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const crosshairPill = crosshairGroup.append('g')
      .attr('transform', 'translate(0, 8)');
    
    crosshairPill.append('rect')
      .attr('x', -45).attr('y', -10)
      .attr('width', 90).attr('height', 18)
      .attr('rx', 9)
      .attr('fill', '#1e293b')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1);

    const crosshairText = crosshairPill.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '9.5px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text('');

    // Overlay to capture mouse events smoothly across the chart
    const overlay = g.append('rect')
      .attr('class', 'chart-interaction-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX, mouseY] = d3.pointer(event, g.node());
      if (mouseX < 0 || mouseX > innerWidth) return;

      const hoveredSalary = Math.round(xScale.invert(mouseX) / 50) * 50;
      setHoveredSalaryLive(hoveredSalary);

      // Position crosshair
      crosshairGroup.style('opacity', 1);
      crosshairLine.attr('x1', mouseX).attr('x2', mouseX);
      crosshairPill.attr('transform', `translate(${mouseX}, 8)`);
      crosshairText.text(formatMoney(hoveredSalary));

      if (viewMode === 'distribution' && yScale) {
        const yVal = getDensityY(hoveredSalary);
        const yPx = yScale(yVal);
        crosshairCircle.attr('cx', mouseX).attr('cy', yPx).style('opacity', 1);
      } else {
        crosshairCircle.attr('cx', mouseX).attr('cy', mouseY).style('opacity', 1);
      }

      // Compute status relative to market range
      let rangeStatusBadge = '';
      if (hoveredSalary < minSalary) {
        rangeStatusBadge = '<span class="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-800">Bazar Minimumundan Aşağı</span>';
      } else if (hoveredSalary >= minSalary && hoveredSalary <= stats.p25) {
        rangeStatusBadge = '<span class="text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-800">İlkin / Junior Aralığı</span>';
      } else if (hoveredSalary > stats.p25 && hoveredSalary <= stats.p75) {
        rangeStatusBadge = '<span class="text-green-300 bg-green-950/60 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-800">Bazarın Əsas Nüvəsi (Optimal IQR)</span>';
      } else if (hoveredSalary > stats.p75 && hoveredSalary <= maxSalary) {
        rangeStatusBadge = '<span class="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded text-[10px] font-bold border border-purple-800">Senior & Yüksək Tələbat</span>';
      } else {
        rangeStatusBadge = '<span class="text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded text-[10px] font-bold border border-indigo-800">Bazar Maksimumunu Aşır (Top)</span>';
      }

      const diffFromUser = hoveredSalary - userExpectationAZN;
      const diffSign = diffFromUser >= 0 ? '+' : '';

      // Comprehensive Tooltip showing exact market min, max, avg, and expectation
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '1';
        const leftPos = Math.min(window.innerWidth - 320, Math.max(16, event.pageX + 16));
        tooltipRef.current.style.left = `${leftPos}px`;
        tooltipRef.current.style.top = `${event.pageY - 145}px`;
        tooltipRef.current.innerHTML = `
          <div class="space-y-2 min-w-[230px]">
            <div class="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
              <span class="font-bold text-slate-200 text-xs flex items-center gap-1">
                <span>💼 ${roleName}</span>
              </span>
              <span class="text-[10px] text-slate-400">${category}</span>
            </div>

            <!-- Current Hovered Point -->
            <div class="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-slate-400">İşarələnən Maaş:</span>
                <span class="text-sm font-black text-white">${formatMoney(hoveredSalary)}</span>
              </div>
              <div class="mt-1">${rangeStatusBadge}</div>
            </div>

            <!-- Real Market Min / Max Range (User Specific Requirement) -->
            <div class="bg-blue-950/40 p-2 rounded-lg border border-blue-900/60 space-y-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                <span>📊 Real Bazar Maaş Aralığı:</span>
              </div>
              <div class="grid grid-cols-2 gap-1 text-[11px]">
                <div>
                  <span class="text-slate-400 block text-[9.5px]">Bazar Minimumu:</span>
                  <strong class="text-amber-300 font-bold">${formatMoney(minSalary)}</strong>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9.5px]">Bazar Maksimumu:</span>
                  <strong class="text-emerald-300 font-bold">${formatMoney(maxSalary)}</strong>
                </div>
              </div>
              <div class="pt-0.5 text-[10px] text-slate-300 flex justify-between border-t border-blue-900/50">
                <span>Orta Bazar (Median):</span>
                <strong class="text-blue-300">${formatMoney(avgSalary)}</strong>
              </div>
            </div>

            <!-- Comparison with User Expectation -->
            <div class="text-[10.5px] text-slate-300 border-t border-slate-800 pt-1 flex items-center justify-between">
              <span>Sizin Gözləntiniz:</span>
              <strong class="text-purple-300">${formatMoney(userExpectationAZN)} (${diffSign}${formatMoney(diffFromUser)})</strong>
            </div>

            <div class="text-[9.5px] text-slate-400 flex items-center gap-1 pt-0.5">
              <span>💡 Klikləyərək gözləntinizi ${formatMoney(hoveredSalary)} edin</span>
            </div>
          </div>
        `;
      }
    });

    overlay.on('mouseleave', () => {
      crosshairGroup.style('opacity', 0);
      setHoveredSalaryLive(null);
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    });

    overlay.on('click', (event) => {
      const [clickX] = d3.pointer(event, g.node());
      if (clickX >= 0 && clickX <= innerWidth) {
        const newSalary = Math.round(xScale.invert(clickX) / 50) * 50;
        if (newSalary > 0) {
          onUpdateUserExpectation(newSalary);
        }
      }
    });

    // -------------------------------------------------------------
    // INTERACTIVE USER EXPECTATION DRAGGABLE MARKER & GUIDELINE
    // -------------------------------------------------------------
    const userX = xScale(userExpectationAZN);
    const clampedUserX = Math.max(0, Math.min(innerWidth, userX));

    const expectationGroup = g.append('g')
      .attr('class', 'user-expectation-interactive')
      .attr('transform', `translate(${clampedUserX}, 0)`);

    // Vertical dashed marker line
    expectationGroup.append('line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 0).attr('y2', innerHeight)
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '5,4')
      .attr('filter', 'url(#d3-glow)');

    // Top Handle / Tag
    const tagWidth = 145;
    const tagHeight = 26;

    const tagG = expectationGroup.append('g')
      .attr('transform', `translate(0, -18)`)
      .attr('cursor', 'ew-resize');

    // Tag background
    tagG.append('rect')
      .attr('x', -tagWidth / 2)
      .attr('y', -tagHeight / 2)
      .attr('width', tagWidth)
      .attr('height', tagHeight)
      .attr('rx', 13)
      .attr('fill', '#7c3aed')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#d3-glow)');

    // Text on tag
    tagG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text(`Sizin Gözlənti: ${formatMoney(userExpectationAZN)}`);

    // Pointer pin at baseline
    expectationGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', innerHeight)
      .attr('r', 5)
      .attr('fill', '#7c3aed')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Draggable behavior via D3 Drag
    const dragBehavior = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const mouseX = event.x;
        const clampedX = Math.max(0, Math.min(innerWidth, mouseX));
        const newSalary = Math.round(xScale.invert(clampedX) / 50) * 50;
        if (newSalary > 0) {
          onUpdateUserExpectation(newSalary);
        }
      });

    tagG.call(dragBehavior);

  }, [
    containerWidth, 
    viewMode, 
    minSalary, 
    avgSalary, 
    maxSalary, 
    experienceBreakdown, 
    matchingVacancies, 
    userExpectationAZN, 
    rate, 
    stats,
    roleName,
    category
  ]);

  return (
    <div 
      ref={containerRef} 
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5 animate-fade-in"
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>D3.js İnteraktiv Bazar Analizi</span>
            </span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              💼 {roleName}
            </span>
            <span className="text-xs text-slate-400">({category})</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>Real Bazar Paylanması & Gözlənti Benchmarkı</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mouse-u qrafikin üzərində gəzdirərək minimum/maksimum aralığı görün, bənövşəyi xətti sürükləyərək və ya birbaşa klikləyərək maaş gözləntinizi müqayisə edin.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-medium shrink-0 self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setViewMode('distribution')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'distribution'
                ? 'bg-white text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paylanma Əyrisi</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('experience_box')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'experience_box'
                ? 'bg-white text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Təcrübə Səviyyələri</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('vacancy_cluster')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'vacancy_cluster'
                ? 'bg-white text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Canlı Elanlar ({stats.vacanciesWithSalary.length})</span>
          </button>
        </div>
      </div>

      {/* Dynamic Role Market Range Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-purple-50/50 p-3 sm:p-4 rounded-xl border border-blue-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>«{roleName}» üzrə Bazar Maaş Diapazonu:</span>
              <span className="text-blue-700 font-black">{formatMoney(minSalary)} — {formatMoney(maxSalary)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Orta bazar göstəricisi: <strong>{formatMoney(avgSalary)}</strong> • Sizin cari gözləntiniz: <strong className="text-purple-700">{formatMoney(userExpectationAZN)}</strong>
            </p>
          </div>
        </div>

        {/* Live Hover Tracker Pill if hovering */}
        {hoveredSalaryLive && (
          <div className="px-3 py-1 rounded-lg bg-white border border-blue-300 shadow-2xs flex items-center gap-2 text-xs animate-fade-in">
            <MousePointer className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span>İşarələnən Hədd: <strong className="text-blue-700 font-bold">{formatMoney(hoveredSalaryLive)}</strong></span>
          </div>
        )}
      </div>

      {/* Primary KPI & Interactive Expectation Snap Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Metric 1: User Percentile */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 rounded-xl border border-purple-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Bazar Persentili</span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-950">
            {stats.percentile}-ci persentil
          </div>
          <p className="text-[11px] text-purple-700 leading-tight">
            Mütəxəssislərin <strong>{stats.percentile}%</strong>-i bu məbləğdən aşağı, <strong>{100 - stats.percentile}%</strong>-i isə yuxarı qazanır.
          </p>
        </div>

        {/* Metric 2: Difference vs Market Median */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Median Fərqi</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {stats.diffAZN >= 0 ? '+' : ''}{formatMoney(stats.diffAZN)}
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Orta bazar həddindən: <strong className={stats.diffAZN >= 0 ? 'text-green-600' : 'text-amber-600'}>
              {stats.diffAZN >= 0 ? '+' : ''}{stats.diffPct}%
            </strong> (Median: {formatMoney(stats.p50)})
          </p>
        </div>

        {/* Metric 3: Live Vacancies Matching */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uyğun Aktiv Elanlar</span>
          <div className="text-xl sm:text-2xl font-black text-blue-700">
            {stats.meetingVacancies.length} elan ({stats.meetingPct}%)
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Portalda ≥ {formatMoney(userExpectationAZN)} maaş təklif edən aktiv şirkətlər.
          </p>
        </div>

        {/* Metric 4: Competitive Standing */}
        <div className={`p-3.5 rounded-xl border space-y-1 ${stats.tierColor}`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider">Bazar Statusu</span>
          <div className="text-base sm:text-lg font-bold">
            {stats.tierText}
          </div>
          <p className="text-[11px] leading-tight opacity-90">
            {stats.tierDesc}
          </p>
        </div>
      </div>

      {/* Quick Snap Buttons for Candidate Expectation */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
          <Target className="w-4 h-4 text-purple-600" />
          <span>Sürətli Hədlər:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onUpdateUserExpectation(minSalary)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              Math.abs(userExpectationAZN - minSalary) < 30
                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Min ({formatMoney(minSalary)})
          </button>
          <button
            type="button"
            onClick={() => onUpdateUserExpectation(stats.p25)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              Math.abs(userExpectationAZN - stats.p25) < 30
                ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            P25 Junior ({formatMoney(stats.p25)})
          </button>
          <button
            type="button"
            onClick={() => onUpdateUserExpectation(stats.p50)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              Math.abs(userExpectationAZN - stats.p50) < 30
                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            P50 Median ({formatMoney(stats.p50)})
          </button>
          <button
            type="button"
            onClick={() => onUpdateUserExpectation(stats.p75)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              Math.abs(userExpectationAZN - stats.p75) < 30
                ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            P75 Senior ({formatMoney(stats.p75)})
          </button>
          <button
            type="button"
            onClick={() => onUpdateUserExpectation(maxSalary)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              Math.abs(userExpectationAZN - maxSalary) < 30
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Maks ({formatMoney(maxSalary)})
          </button>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div className="relative w-full bg-slate-50/50 rounded-xl border border-slate-200/80 p-2 sm:p-3 overflow-hidden select-none">
        <svg 
          ref={svgRef} 
          className="w-full overflow-visible" 
          style={{ minHeight: '320px' }}
        />

        {/* Hover & Drag Hint helper tag */}
        <div className="absolute right-4 top-3 pointer-events-none hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
          <MousePointer className="w-3 h-3 text-blue-600" />
          <span>Mouse hover: Min/Maks aralıq tooltipi • Sürüklə/Kliklə: Gözləntini dəyiş</span>
        </div>
      </div>

      {/* Floating D3 Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none transition-opacity duration-150 opacity-0 bg-slate-900/95 text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-md max-w-xs"
      />

      {/* Legend & Context Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Mavi Əyri: Real Bazar Sıxlığı</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Min ({formatMoney(minSalary)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Maks ({formatMoney(maxSalary)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span>Bənövşəyi Marker: Sizin Gözləntiniz ({formatMoney(userExpectationAZN)})</span>
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          * D3.js ilə dinamik render edilir; kursor hərəkəti ilə canlı min/maks diapazon analitikası.
        </span>
      </div>
    </div>
  );
};
