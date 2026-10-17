import QRCode from "qrcode";
import CopyButton from "@/components/CopyButton";
export const metadata = { title: "Sponsor us" };
const ADDRESS = "0x7bec7212db29ee46d4222d80ff8a64eaaa84fb57";
const NETWORKS = ["Base", "Polygon", "BNB Chain (BSC)"];
export default async function Page() {
  const svg = await QRCode.toString(ADDRESS, { type: "svg", margin: 1, width: 220 });
  return (<main>
    <h1>Sponsor QQ</h1>
    <p>Sponsorships help keep QQ running. Sponsored listings will always be clearly labelled as sponsored and do not change editorial order.</p>
    <h2>Pay with USDC</h2>
    <p style={{ border: "2px solid #b00020", padding: 12, borderRadius: 8 }}><b>Warning:</b> send only <b>USDC</b> on one of these three networks: <b>Base</b>, <b>Polygon</b> or <b>BNB Chain (BSC)</b>. Other networks or other tokens may be lost permanently.</p>
    <p>Accepted networks (same address on each):</p>
    <ul>{NETWORKS.map((n) => <li key={n}><b>USDC on {n}</b></li>)}</ul>
    <p>Address:</p>
    <p><code id="usdc-address" style={{ wordBreak: "break-all" }}>{ADDRESS}</code></p>
    <p><CopyButton text={ADDRESS} /></p>
    <div role="img" aria-label="QR code of the USDC receiving address" dangerouslySetInnerHTML={{ __html: svg }} />
    <p><small>Select the network in your wallet before sending; the QR code contains only the address. Note: USDC on BNB Chain uses a different token contract and decimals than on Base/Polygon, so make sure your wallet shows it as USDC on BNB Chain. Payments are on-chain and generally irreversible; double-check the address and network.</small></p>
  </main>);
}
