// src/assets/demo/chart-bar-demo.js
document.addEventListener("DOMContentLoaded", function() {
  const ctx = document.getElementById('myBarChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [4215, 5312, 6251, 7841, 9821, 14984],
        backgroundColor: '#4e73df'
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
});