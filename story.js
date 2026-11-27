const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
function drawLines(context, lines, x, y, lineHeight) {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}
async function createStoryCard(number2, title2, dek2) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Story card could not be created.");
  context.fillStyle = "#10100f";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.strokeStyle = "rgba(241, 238, 230, 0.07)";
  context.lineWidth = 2;
  for (let x = 0; x <= CARD_WIDTH; x += 120) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, CARD_HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= CARD_HEIGHT; y += 120) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(CARD_WIDTH, y);
    context.stroke();
  }
  context.fillStyle = "#ff5c35";
  context.fillRect(0, 0, 22, CARD_HEIGHT);
  context.fillStyle = "#ff5c35";
  context.font = "700 32px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.letterSpacing = "4px";
  context.fillText(`ESSAY ${number2}`, 92, 150);
  context.textAlign = "right";
  context.fillStyle = "#f1eee6";
  context.font = "900 58px Arial, Helvetica, sans-serif";
  context.letterSpacing = "-3px";
  context.fillText("JM", 988, 158);
  context.fillStyle = "#ff5c35";
  context.fillText(".", 1016, 158);
  context.textAlign = "left";
  context.fillStyle = "rgba(255, 92, 53, 0.11)";
  context.font = "900 610px Arial, Helvetica, sans-serif";
  context.fillText(number2, 500, 690);
  context.fillStyle = "#f1eee6";
  context.font = "700 108px Arial, Helvetica, sans-serif";
  context.letterSpacing = "-5px";
  const titleLines = wrapText(context, title2, 890);
  const titleY = 610;
  drawLines(context, titleLines, 92, titleY, 111);
  const ruleY = titleY + titleLines.length * 111 + 68;
  context.fillStyle = "#ff5c35";
  context.fillRect(92, ruleY, 150, 7);
  context.fillStyle = "#bcb8ae";
  context.font = "400 42px Arial, Helvetica, sans-serif";
  context.letterSpacing = "0px";
  const dekLines = wrapText(context, dek2, 830);
  drawLines(context, dekLines, 92, ruleY + 105, 61);
  context.fillStyle = "#f1eee6";
  context.font = "700 34px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.letterSpacing = "4px";
  context.fillText("JOSHUA MCINTYRE", 92, 1740);
  context.fillStyle = "#ff5c35";
  context.font = "700 31px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.letterSpacing = "3px";
  context.fillText("JMCINTYRE.ME", 92, 1812);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Story card could not be saved."));
    }, "image/png");
  });
}
const title = document.querySelector(".article-title").textContent;
const dek = document.querySelector(".article-dek").textContent;
const number = document.querySelector(".article-kicker span").textContent.replace(/[^0-9]/g, "");
function setStatus(s) {
  document.querySelector(".share-status").textContent = s;
}
function setWorking(value) {
  document.querySelector(".story-button").disabled = value;
}
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    setStatus("Article link copied.");
  } catch {
    setStatus("Copy the address from your browser to add the link.");
  }
}
async function shareCard() {
  setWorking(true);
  setStatus("Creating your Story card...");
  try {
    const blob = await createStoryCard(number, title, dek);
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-story.png`;
    const file = new File([blob], filename, { type: "image/png" });
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
    }
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text: `${dek}
${window.location.href}`
      });
      setStatus("Card shared. The article link is copied for Instagram\u2019s Link sticker.");
    } else {
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      setStatus("Card downloaded. The article link is copied for Instagram\u2019s Link sticker.");
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      setStatus("Sharing canceled.");
    } else {
      setStatus("The card could not be created. Try copying the article link instead.");
    }
  } finally {
    setWorking(false);
  }
}
document.querySelector(".story-button").addEventListener("click", shareCard);
document.querySelector(".copy-button").addEventListener("click", copyLink);
