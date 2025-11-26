
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panels .panel');

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      panels[index].classList.add('active');
    });
  });

  // Default active tab
  buttons[0].classList.add('active');
  panels[0].classList.add('active');
});
