import fetch from "node-fetch";

(async () => {
  const request = await fetch("https://api.npoint.io/d00f129e5d04d8b88413", {
    method: "put",
    body: JSON.stringify({ b: 2 }),
    headers: { "Content-Type": "application/json" },
  });
  request.

  const response = await fetch("https://api.npoint.io/d00f129e5d04d8b88413");
  console.log(await response.text());
})();
