document.getElementById('syncBtn').addEventListener('click', async () => {
  const res = await fetch('/shop-sync', { method: 'POST' });
  const data = await res.json();
  alert(JSON.stringify(data));
});
