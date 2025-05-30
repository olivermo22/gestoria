async function handleSend() {
  const input = document.getElementById("user-input");
  const output = document.getElementById("chat-output");
  const message = input.value;
  input.value = "";

  let threadId = localStorage.getItem("thread_id");
  if (!threadId) {
    const threadRes = await fetch("/api/thread");
    const data = await threadRes.json();
    threadId = data.thread_id;
    localStorage.setItem("thread_id", threadId);
  }

  const res = await fetch("/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });

  const data = await res.json();
  output.innerHTML += "<div><strong>Tú:</strong> " + message + "</div>";
  output.innerHTML += "<div><strong>Bot:</strong> " + data.reply + "</div>";
}
