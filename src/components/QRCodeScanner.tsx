// components/QRCodeScanner.tsx
"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRCodeScanner({
  onScanSuccess,
}: {
  onScanSuccess: (decodedText: string) => void;
}) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    }, false); // Added 'verbose' argument as false

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear(); // หยุดหลังเจอ 1 ครั้ง
      },
      () => {
        // Handle scan failure if needed
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return <div id="reader" />;
}
