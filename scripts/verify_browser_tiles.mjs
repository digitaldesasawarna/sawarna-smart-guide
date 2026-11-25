import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--user-data-dir=' + process.env.TEMP + '\\edge_test_' + Date.now(),
  'http://localhost:8080/index.html'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9229/json');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:8080'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                const allImgs = Array.from(document.querySelectorAll('img.leaflet-tile'));
                const customTiles = allImgs.filter(img => img.src.includes('assets/maps/tiles'));
                const googleTiles = allImgs.filter(img => img.src.includes('google.com'));
                return {
                  totalTiles: allImgs.length,
                  googleTilesCount: googleTiles.length,
                  customIllustratedTilesCount: customTiles.length,
                  customTileSrcs: customTiles.map(img => img.src.split('smart_guide/')[1] || img.src)
                };
              })()
            `,
            returnByValue: true
          }
        }));
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 2) {
        console.log('Browser Live Tile Verification:');
        console.log(JSON.stringify(data.result?.result?.value, null, 2));
        ws.close();
        proc.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
