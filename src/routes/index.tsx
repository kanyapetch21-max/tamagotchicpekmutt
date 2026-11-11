import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ตัวนับ — เครื่องมือนับเลขแบบง่าย" },
      {
        name: "description",
        content: "กดปุ่มเพื่อเพิ่มจำนวน นับเลขได้ง่าย ๆ พร้อมปุ่มลดและเริ่มนับใหม่",
      },
      { property: "og:title", content: "ตัวนับ — เครื่องมือนับเลขแบบง่าย" },
      {
        property: "og:description",
        content: "กดปุ่มเพื่อเพิ่มจำนวน นับเลขได้ง่าย ๆ พร้อมปุ่มลดและเริ่มนับใหม่",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

export function Index() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-page">
      <header className="counter-header">
        <a className="counter-brand" href="/" aria-label="ตัวนับ หน้าหลัก">
          <span className="counter-brand-mark" aria-hidden="true">
            <Plus />
          </span>
          <span>ตัวนับ</span>
        </a>
        <span className="counter-status">
          <span className="counter-status-dot" aria-hidden="true" />
          พร้อมนับ
        </span>
      </header>

      <main className="counter-main">
        <div className="counter-eyebrow">
          <span>เครื่องมือนับจำนวน</span>
          <span className="counter-eyebrow-line" aria-hidden="true" />
        </div>
        <h1 className="counter-title">นับไปด้วยกัน</h1>

        <div className="counter-display" aria-live="polite" aria-atomic="true">
          <span className="counter-number">{count.toLocaleString("th-TH")}</span>
          <span className="counter-unit">ครั้ง</span>
        </div>

        <div className="counter-controls">
          <Button
            variant="outline"
            size="icon"
            className="counter-step-button"
            aria-label="ลดเลข"
            title="ลดเลข"
            onClick={() => setCount((current) => Math.max(0, current - 1))}
          >
            <Minus />
          </Button>
          <Button className="counter-increment-button" onClick={() => setCount((current) => current + 1)}>
            <Plus />
            เพิ่ม 1
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="counter-step-button counter-reset-button"
            aria-label="เริ่มนับใหม่"
            title="เริ่มนับใหม่"
            onClick={() => setCount(0)}
          >
            <RotateCcw />
          </Button>
        </div>

        <p className="counter-caption">จำนวนปัจจุบัน</p>
      </main>

      <footer className="counter-footer">
        <span>นับได้ทุกเรื่องที่สำคัญ</span>
        <span className="counter-footer-mark" aria-hidden="true">✳</span>
      </footer>
    </div>
  );
}
