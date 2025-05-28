/* Pure JS Pie Chart Implementation with Animation and Percentage Text */
function drawPieChart(canvasId, chartData, animationDuration = 1000) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) {
        // console.error(`Canvas element #${canvasId} or parent not found`);
        return; // Silently return if canvas not found (e.g., on non-dashboard pages)
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error(`Failed to get 2D context for ${canvasId}`);
        return;
    }

    // --- Canvas Sizing Aspect Ratio Fix --- 
    const container = canvas.parentElement;
    const size = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    // --- End Fix ---

    const data = chartData.datasets[0].data;
    const colors = chartData.datasets[0].backgroundColor;
    const total = data.reduce((sum, value) => sum + value, 0);
    const startAngle = -0.5 * Math.PI; // Start at the top

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4; 
    const textRadius = radius * 0.7; 

    let startTime = null;

    function animateChart(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const animationProgress = Math.min(elapsedTime / animationDuration, 1); 

        ctx.clearRect(0, 0, size, size);

        let currentAngle = startAngle;

        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0) continue;

            const sliceAngle = (data[i] / total) * 2 * Math.PI;
            const animatedAngle = sliceAngle * animationProgress;
            const endAngle = currentAngle + animatedAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();

            currentAngle = endAngle;
        }
        
        if (animationProgress === 1) {
            currentAngle = startAngle;
            for (let i = 0; i < data.length; i++) {
                if (data[i] === 0) continue;

                const sliceAngle = (data[i] / total) * 2 * Math.PI;
                const midAngle = currentAngle + sliceAngle / 2;

                const textX = centerX + Math.cos(midAngle) * textRadius;
                const textY = centerY + Math.sin(midAngle) * textRadius;

                const percentage = ((data[i] / total) * 100).toFixed(1) + '%';
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                ctx.fillText(percentage, textX, textY);
                
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                currentAngle += sliceAngle;
            }
        }

        if (animationProgress < 1) {
            requestAnimationFrame(animateChart);
        }
    }

    requestAnimationFrame(animateChart);
}

/* Sidebar Navigation */
function openNav() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    if (sidebar) sidebar.style.width = "250px";
    if (main && window.innerWidth > 768) {
         main.style.marginLeft = "250px";
    }
}

function closeNav() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    if (sidebar) sidebar.style.width = "0";
    if (main) main.style.marginLeft = "0";
}

/* Custom Chart Initialization (Dashboard Only) */
function initializeDashboardChart() {
    const chartCanvasId = "progressChart";
    const chartCanvas = document.getElementById(chartCanvasId);
    if (!chartCanvas || !chartCanvas.parentElement) {
        // console.log("Progress chart not found on this page.");
        return; // Exit if chart canvas doesn't exist
    }
    
    const data = {
        labels: ["Quiz", "Pertemuan", "Materi"],
        datasets: [{
            label: "Progres Pembelajaran",
            data: [25, 33.8, 41.3],
            backgroundColor: [
                "rgb(54, 162, 235)",
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)"
            ],
        }]
    };
    requestAnimationFrame(() => drawPieChart(chartCanvasId, data)); 
}

/* DOMContentLoaded Handler */
document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".sidebar .menu-item");
    const currentPagePath = window.location.pathname.split('/').pop(); // Get filename (e.g., index.html, per1.html)
    const isIndexPage = currentPagePath === "index.html" || currentPagePath === ""; // Check if it's the root/index page
    let resizeTimer;

    // Set active menu item based on current page URL
    menuItems.forEach(item => {
        const itemPath = item.getAttribute("href").split('/').pop(); // Get filename from href
        
        // Handle index.html specifically
        if (isIndexPage && item.getAttribute("href") === "index.html") {
            item.classList.add("active");
        } else if (!isIndexPage && itemPath === currentPagePath) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }

        // Remove previous dynamic loading listeners if any exist
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Add listener to close sidebar on click for mobile
        newItem.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeNav();
            }
        });
    });

    // Initialize dashboard chart ONLY on index.html
    if (isIndexPage) {
        requestAnimationFrame(initializeDashboardChart);
    }

    // Debounced resize handler for dashboard chart (if present)
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isIndexPage) {
                 requestAnimationFrame(initializeDashboardChart);
            }
        }, 250);
    }

    window.addEventListener("resize", handleResize);

    // --- Removed Dynamic Content Loading Logic --- 
});
