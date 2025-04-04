// src/assets/demo/chart-area-demo.js
document.addEventListener("DOMContentLoaded", function() {
  const ctx = document.getElementById('myAreaChart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Performance',
        data: [0, 10000, 5000, 15000, 10000, 20000],
        borderColor: '#4e73df',
        tension: 0.3
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
});