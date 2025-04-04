self.onmessage = (event) => {
    const { text } = event.data;
  
    try {
      const rows = parseCSV(text, (progress) => {
        self.postMessage({ type: "progress", progress });
      });
  
      self.postMessage({ success: true, data: rows });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error parsing CSV file";
  
      self.postMessage({
        success: false,
        error: `Error parsing CSV file: ${errorMessage}`,
      });
    }
  };
  
  function parseCSV(text: string, onProgress: (progress: number) => void): string[][] {
    const rows: string[][] = [];
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const totalLines = lines.length;
  
    for (let i = 0; i < totalLines; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
  
      const row: string[] = [];
      let insideQuotes = false;
      let currentValue = "";
  
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
  
        if (char === '"') {
          if (insideQuotes && line[j + 1] === '"') {
            currentValue += '"';
            j++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === "," && !insideQuotes) {
          row.push(currentValue);
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
  
      row.push(currentValue);
      rows.push(row);
  
      if (i % 100 === 0 || i === totalLines - 1) {
        onProgress(i / totalLines);
      }
    }
  
    return rows;
  }
  