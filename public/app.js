async function testLoadBalance() {
  const result = document.getElementById("result");
  result.textContent = "Testing load balance...\n";

  for (let i = 1; i <= 20; i++) {
    try {
      const res = await fetch("/api/whoami");
      const data = await res.json();
      result.textContent += i + ". " + data.server + "\n";
    } catch (err) {
      result.textContent += i + ". ERROR\n";
    }
  }
}
