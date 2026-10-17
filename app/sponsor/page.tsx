import QRCode from "qrcode";
import CopyButton from "@/components/CopyButton";
export const metadata = { title: "Sponsor us" };
const EVM = "0xb7638366ab4df9f2ab847980948e9075dfd941e7";
const SOL = "DtpvU6gW68utoSex6zYaHJ2BeRyNRcDfeG3eH97uMedG";
const TRX = "TSgssU7SbknVBS9MFi5PeGfPHFieN5KzjJ";
const OPTIONS = [
  { id: "usdc-base", label: "USDC on Base", address: EVM },
  { id: "usdc-polygon", label: "USDC on Polygon", address: EVM },
  { id: "usdc-bsc", label: "USDC on BNB Chain (BSC)", address: EVM },
  { id: "usdc-solana", label: "USDC on Solana", address: SOL },
  { id: "usdt-tron", label: "USDT on TRON (TRC20)", address: TRX },
];
export default async function Page() {
  const qrs = await Promise.all(OPTIONS.map((o) => QRCode.toString(o.address, { type: "svg", margin: 1, width: 180 })));
  return (<main>
    <h1>Sponsor QQ</h1>
    <p>Sponsorships help keep QQ running. Sponsored listings will always be clearly labelled as sponsored and do not change editorial order.</p>
    <p style={{ border: "2px solid #b00020", padding: 12, borderRadius: 8 }}><b>Warning:</b> send only the token named on each card, on the network named on that card. Solana and TRON addresses cannot receive EVM networks (Base, Polygon, BNB Chain), and EVM addresses cannot receive Solana or TRON. Wrong network or wrong token may be lost permanently.</p>
    {OPTIONS.map((o, i) => (
      <section className="card" key={o.id} id={o.id}>
        <h2 style={{ marginTop: 0 }}>{o.label}</h2>
        <p style={{ margin: "4px 0" }}>Send only <b>{o.label}</b> to:</p>
        <p><code style={{ wordBreak: "break-all" }}>{o.address}</code></p>
        <p><CopyButton text={o.address} /></p>
        <div role="img" aria-label={`QR code of the ${o.label} address`} dangerouslySetInnerHTML={{ __html: qrs[i] }} />
      </section>
    ))}
    <p><small>The QR codes contain only the address; select the correct network in your wallet. USDC on BNB Chain uses a different token contract and decimals than on Base/Polygon. Payments are on-chain and generally irreversible; double-check the address and network.</small></p>
  </main>);
}
