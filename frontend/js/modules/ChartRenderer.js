// Chart renderer class - uses SVG to draw simple charts
export class ChartRenderer {
    constructor() {
        this.colors = {
            primary: '#00d4ff',
            secondary: '#00ff88',
            warning: '#ffaa00',
            danger: '#ff3366'
        };
    }

    // Render bar chart
    renderBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.clientWidth || 400;
        const height = 200;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Clear container
        container.innerHTML = '';

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.display = 'block';

        if (!data || data.length === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', width / 2);
            text.setAttribute('y', height / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#a0b0d0');
            text.textContent = 'No data';
            svg.appendChild(text);
            container.appendChild(svg);
            return;
        }

        // Calculate maximum value
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const barWidth = chartWidth / data.length - 10;

        // Draw bar chart
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (chartWidth / data.length) + 5;
            const y = padding + chartHeight - barHeight;

            // Draw bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', item.color || this.colors.primary);
            rect.setAttribute('rx', 4);
            svg.appendChild(rect);

            // Draw value label
            if (barHeight > 20) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', '#e0e8ff');
                text.setAttribute('font-size', '12');
                text.textContent = item.value.toFixed(0);
                svg.appendChild(text);
            }

            // Draw label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + barWidth / 2);
            label.setAttribute('y', height - padding + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#a0b0d0');
            label.setAttribute('font-size', '11');
            label.textContent = item.label || '';
            svg.appendChild(label);
        });

        // Draw Y axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', padding);
        yAxis.setAttribute('y1', padding);
        yAxis.setAttribute('x2', padding);
        yAxis.setAttribute('y2', padding + chartHeight);
            yAxis.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
        yAxis.setAttribute('stroke-width', '2');
        svg.insertBefore(yAxis, svg.firstChild);

        // Draw X axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', padding);
        xAxis.setAttribute('y1', padding + chartHeight);
        xAxis.setAttribute('x2', padding + chartWidth);
        xAxis.setAttribute('y2', padding + chartHeight);
            xAxis.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
        xAxis.setAttribute('stroke-width', '2');
        svg.insertBefore(xAxis, svg.firstChild);

        container.appendChild(svg);
    }

    // Render pie chart
    renderPieChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = Math.min(container.clientWidth || 300, 300);
        const radius = size / 2 - 20;
        const centerX = size / 2;
        const centerY = size / 2;

        container.innerHTML = '';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.display = 'block';

        if (!data || data.length === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', centerY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#a0b0d0');
            text.textContent = 'No data';
            svg.appendChild(text);
            container.appendChild(svg);
            return;
        }

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', centerY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#a0b0d0');
            text.textContent = 'No data';
            svg.appendChild(text);
            container.appendChild(svg);
            return;
        }

        const colors = [this.colors.primary, this.colors.secondary, this.colors.warning, this.colors.danger, '#9b59b6', '#1abc9c'];
        let currentAngle = -90;

        data.forEach((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
            const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
            const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
            const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);

            const largeArc = angle > 180 ? 1 : 0;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            path.setAttribute('d', d);
            path.setAttribute('fill', item.color || colors[index % colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            svg.appendChild(path);

            // Add label
            const labelAngle = (startAngle + endAngle) / 2;
            const labelX = centerX + (radius + 30) * Math.cos(labelAngle * Math.PI / 180);
            const labelY = centerY + (radius + 30) * Math.sin(labelAngle * Math.PI / 180);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#e0e8ff');
            text.setAttribute('font-size', '12');
            text.textContent = `${item.label}: ${((item.value / total) * 100).toFixed(1)}%`;
            svg.appendChild(text);

            currentAngle = endAngle;
        });

        container.appendChild(svg);
    }

    // Render line chart
    renderLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.clientWidth || 400;
        const height = 200;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        container.innerHTML = '';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.display = 'block';

        if (!data || data.length === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', width / 2);
            text.setAttribute('y', height / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#a0b0d0');
            text.textContent = 'No data';
            svg.appendChild(text);
            container.appendChild(svg);
            return;
        }

        const maxValue = Math.max(...data.map(d => d.value), 1);
        const points = data.map((item, index) => {
            const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
            const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
            return { x, y, value: item.value, label: item.label };
        });

        // Draw line
        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.colors.primary);
        path.setAttribute('stroke-width', '3');
        svg.appendChild(path);

        // Draw data points
        points.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', this.colors.primary);
            svg.appendChild(circle);

            // Draw value label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', point.x);
            text.setAttribute('y', point.y - 10);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#e0e8ff');
            text.setAttribute('font-size', '10');
            text.textContent = point.value.toFixed(0);
            svg.appendChild(text);
        });

        // Draw coordinate axes
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', padding);
        yAxis.setAttribute('y1', padding);
        yAxis.setAttribute('x2', padding);
        yAxis.setAttribute('y2', padding + chartHeight);
            yAxis.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
        yAxis.setAttribute('stroke-width', '2');
        svg.insertBefore(yAxis, svg.firstChild);

        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', padding);
        xAxis.setAttribute('y1', padding + chartHeight);
        xAxis.setAttribute('x2', padding + chartWidth);
        xAxis.setAttribute('y2', padding + chartHeight);
            xAxis.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
        xAxis.setAttribute('stroke-width', '2');
        svg.insertBefore(xAxis, svg.firstChild);

        container.appendChild(svg);
    }
}


